package com.stationstories.service;

import com.stationstories.dto.bill.*;
import com.stationstories.entity.*;
import com.stationstories.entity.enums.DiscountType;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.entity.enums.PaymentStatus;
import com.stationstories.entity.enums.WhatsAppDeliveryStatus;
import com.stationstories.exception.BusinessException;
import com.stationstories.exception.ResourceNotFoundException;
import com.stationstories.repository.BillNumberSequenceRepository;
import com.stationstories.repository.BillOperationRepository;
import com.stationstories.repository.BillRepository;
import com.stationstories.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BillService {

    private static final Logger log = LoggerFactory.getLogger(BillService.class);

    private final BillRepository billRepository;
    private final BillNumberSequenceRepository sequenceRepository;
    private final MenuItemRepository menuItemRepository;
    private final CustomerService customerService;
    private final RestaurantSettingService settingService;
    private final AuditLogService auditLogService;
    private final BillOperationRepository billOperationRepository;
    private final BillOperationRegistrationService billOperationRegistrationService;
    private final BillProcessingService billProcessingService;

    @Value("${app.public-url:http://localhost:5173}")
    private String publicBaseUrl;

    public BillService(BillRepository billRepository,
                       BillNumberSequenceRepository sequenceRepository,
                       MenuItemRepository menuItemRepository,
                       CustomerService customerService,
                       RestaurantSettingService settingService,
                       AuditLogService auditLogService,
                       BillOperationRepository billOperationRepository,
                       BillOperationRegistrationService billOperationRegistrationService,
                       BillProcessingService billProcessingService) {
        this.billRepository = billRepository;
        this.sequenceRepository = sequenceRepository;
        this.menuItemRepository = menuItemRepository;
        this.customerService = customerService;
        this.settingService = settingService;
        this.auditLogService = auditLogService;
        this.billOperationRepository = billOperationRepository;
        this.billOperationRegistrationService = billOperationRegistrationService;
        this.billProcessingService = billProcessingService;
    }

    public BillResponse createBill(CreateBillRequest request, User cashier) {
        return createBill(request, cashier, null);
    }

    public BillResponse createBill(CreateBillRequest request, User cashier, String idempotencyKey) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("Cannot create an empty bill. At least one dish item is required.");
        }

        RestaurantSetting settings = settingService.getOrCreateSettings();

        // 1. Resolve and validate idempotency key
        String effectiveKey = null;
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            effectiveKey = idempotencyKey.trim();
        } else if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty()) {
            effectiveKey = request.getIdempotencyKey().trim();
        } else {
            effectiveKey = "OP-" + UUID.randomUUID().toString();
        }

        // 2. Claim operation in isolated REQUIRES_NEW transaction before bill processing
        BillOperation op = billOperationRegistrationService.claimOperation(effectiveKey, cashier, request.getDeviceId());

        // 3. Inspect existing state if replaying
        if (BillOperation.STATUS_SUCCEEDED.equals(op.getStatus())) {
            Bill existingBill = op.getBill();
            if (existingBill == null) {
                existingBill = billRepository.findByIdempotencyKey(effectiveKey).orElse(null);
            }
            if (existingBill != null) {
                log.info("Idempotent bill creation: existing bill #{} returned for key {}",
                        existingBill.getBillNumber(), effectiveKey);
                return mapToResponse(existingBill, settings);
            }
        } else if (BillOperation.STATUS_DEFINITIVELY_FAILED.equals(op.getStatus())) {
            throw new BusinessException("Bill creation for this operation key previously failed: " + op.getErrorMessage());
        } else if (BillOperation.STATUS_NEEDS_REVIEW.equals(op.getStatus())) {
            throw new BusinessException("Bill creation for this operation key requires review: " + op.getErrorMessage());
        }

        // 4. Execute bill creation inside its own transactional boundary
        Bill saved;
        try {
            boolean isOffline = Boolean.TRUE.equals(request.getIsOfflineCreated());
            Instant syncedAt = isOffline ? Instant.now() : null;
            saved = billProcessingService.executeBillCreation(
                    request,
                    cashier,
                    effectiveKey,
                    request.getDeviceId(),
                    request.getLocalBillReference(),
                    isOffline,
                    syncedAt
            );
        } catch (Exception ex) {
            String errorMsg = ex.getMessage() != null ? ex.getMessage() : "Bill creation failed";
            if (ex instanceof BusinessException || ex instanceof ResourceNotFoundException || ex instanceof IllegalArgumentException) {
                billOperationRegistrationService.markFailed(effectiveKey, errorMsg);
            } else {
                billOperationRegistrationService.markNeedsReview(effectiveKey, errorMsg);
            }
            throw ex;
        }

        // 5. Mark operation SUCCEEDED in isolated transaction
        billOperationRegistrationService.markSucceeded(effectiveKey, saved);

        return mapToResponse(saved, settings);
    }

    @Transactional(readOnly = true)
    public BillOperationResponse reconcileOperation(String operationKey, User currentUser) {
        if (operationKey == null || operationKey.trim().isEmpty()) {
            return BillOperationResponse.notFound(operationKey);
        }

        String key = operationKey.trim();
        RestaurantSetting settings = settingService.getOrCreateSettings();

        // 1. Check if a bill exists with this idempotency key
        Optional<Bill> billOpt = billRepository.findByIdempotencyKey(key);
        if (billOpt.isPresent()) {
            Bill bill = billOpt.get();
            verifyOperationAccess(bill.getCashier(), currentUser);
            return BillOperationResponse.succeeded(key, mapToResponse(bill, settings), bill.getCreatedAt());
        }

        // 2. Check if a bill operation record exists
        Optional<BillOperation> opOpt = billOperationRepository.findByOperationKey(key);
        if (opOpt.isPresent()) {
            BillOperation op = opOpt.get();
            verifyOperationAccess(op.getCashier(), currentUser);

            if (BillOperation.STATUS_SUCCEEDED.equals(op.getStatus())) {
                Bill bill = op.getBill();
                if (bill == null) {
                    bill = billRepository.findByIdempotencyKey(key).orElse(null);
                }
                if (bill != null) {
                    return BillOperationResponse.succeeded(key, mapToResponse(bill, settings), op.getCreatedAt());
                }
            }

            if (BillOperation.STATUS_DEFINITIVELY_FAILED.equals(op.getStatus())) {
                return BillOperationResponse.definitivelyFailed(key, op.getErrorMessage(), op.getCreatedAt());
            }

            if (BillOperation.STATUS_NEEDS_REVIEW.equals(op.getStatus())) {
                return BillOperationResponse.needsReview(key, op.getErrorMessage(), op.getCreatedAt());
            }

            if (BillOperation.STATUS_PROCESSING.equals(op.getStatus())) {
                // Double check bill in database
                Optional<Bill> raceBill = billRepository.findByIdempotencyKey(key);
                if (raceBill.isPresent()) {
                    return BillOperationResponse.succeeded(key, mapToResponse(raceBill.get(), settings), raceBill.get().getCreatedAt());
                }
                // Never mark failed merely because 60 seconds passed!
                return BillOperationResponse.processing(key, op.getCreatedAt());
            }
        }

        // 3. No bill and no operation record found
        return BillOperationResponse.notFound(key);
    }

    private void verifyOperationAccess(User operationCashier, User currentUser) {
        if (currentUser == null) return;
        boolean isAdmin = currentUser.getRoles() != null && currentUser.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        if (!isAdmin && operationCashier != null && !operationCashier.getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "Unauthorized to access operation record belonging to another cashier.");
        }
    }

    @Transactional(readOnly = true)
    public BillResponse getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));
        RestaurantSetting settings = settingService.getOrCreateSettings();
        return mapToResponse(bill, settings);
    }

    @Transactional(readOnly = true)
    public BillResponse getBillByUuid(String uuid) {
        Bill bill = billRepository.findByInvoiceUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with Invoice UUID: " + uuid));
        RestaurantSetting settings = settingService.getOrCreateSettings();
        return mapToResponse(bill, settings);
    }

    @Transactional
    public BillResponse cancelBill(Long id, CancelBillRequest request, User admin) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));

        if (bill.getPaymentStatus() == PaymentStatus.CANCELLED) {
            throw new BusinessException("Bill " + bill.getBillNumber() + " is already cancelled.");
        }

        BigDecimal refund = request.getRefundAmount() != null ? request.getRefundAmount() : BigDecimal.ZERO;
        if (refund.compareTo(bill.getGrandTotal()) > 0) {
            throw new BusinessException("Refund amount (₹" + refund + ") cannot exceed original grand total (₹" + bill.getGrandTotal() + ").");
        }

        bill.setPaymentStatus(PaymentStatus.CANCELLED);
        bill.setCancellationReason(request.getCancellationReason().trim());
        bill.setCancelledBy(admin);
        bill.setCancelledAt(Instant.now());
        bill.setRefundAmount(refund);

        // Update payment status to REFUNDED if applicable
        for (Payment payment : bill.getPayments()) {
            if (refund.compareTo(BigDecimal.ZERO) > 0) {
                payment.setStatus(PaymentStatus.REFUNDED);
            }
        }

        Bill updated = billRepository.save(bill);

        auditLogService.recordEvent("BILL", updated.getId(), "BILL_CANCELLED", admin,
                "Status: PAID", "Status: CANCELLED (Refund: ₹" + refund + ", Reason: " + request.getCancellationReason() + ")", null);

        log.warn("Bill #{} cancelled by user {} with reason: {}", updated.getBillNumber(), admin.getUsername(), request.getCancellationReason());
        RestaurantSetting settings = settingService.getOrCreateSettings();
        return mapToResponse(updated, settings);
    }

    @Transactional
    public BillResponse updateWhatsAppStatus(Long id, WhatsAppDeliveryStatus status, User user) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));

        bill.setWhatsappDeliveryStatus(status);
        if (status == WhatsAppDeliveryStatus.MANUALLY_SENT || status == WhatsAppDeliveryStatus.DELIVERY_CONFIRMED) {
            bill.setWhatsappSentAt(Instant.now());
        }

        Bill updated = billRepository.save(bill);
        auditLogService.recordEvent("BILL", updated.getId(), "WHATSAPP_STATUS_UPDATED", user,
                null, "Status changed to: " + status, null);

        RestaurantSetting settings = settingService.getOrCreateSettings();
        return mapToResponse(updated, settings);
    }

    @Transactional(readOnly = true)
    public Page<BillResponse> searchBills(PaymentStatus status, PaymentMethod method, Instant fromDate, Instant toDate, Pageable pageable) {
        RestaurantSetting settings = settingService.getOrCreateSettings();
        return billRepository.searchBills(status, method, fromDate, toDate, pageable)
                .map(b -> mapToResponse(b, settings));
    }

    @Transactional(readOnly = true)
    public List<BillResponse> getCustomerBills(Long customerId) {
        RestaurantSetting settings = settingService.getOrCreateSettings();
        return billRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(b -> mapToResponse(b, settings))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ThermalReceiptResponse getThermalReceipt(Long id, String width) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));
        RestaurantSetting settings = settingService.getOrCreateSettings();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy").withZone(ZoneId.of("Asia/Kolkata"));
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a").withZone(ZoneId.of("Asia/Kolkata"));

        ThermalReceiptResponse receipt = new ThermalReceiptResponse();
        receipt.setRestaurantName(settings.getRestaurantName());
        receipt.setTagline(settings.getTagline());
        receipt.setAddress(settings.getAddress());
        receipt.setPhone(settings.getPhonePrimary());
        receipt.setGstin(settings.isGstEnabled() ? settings.getGstin() : null);
        receipt.setBillNumber(bill.getBillNumber());
        receipt.setDate(dateFormatter.format(bill.getCreatedAt()));
        receipt.setTime(timeFormatter.format(bill.getCreatedAt()));
        receipt.setOrderType(bill.getOrderType().name());
        receipt.setCabinTableRef(bill.getCabinTableRef());
        receipt.setCustomerName(bill.getCustomerNameSnapshot());
        receipt.setCashierName(bill.getCashier() != null ? bill.getCashier().getFullName() : "Staff");

        List<ThermalReceiptResponse.ThermalReceiptItem> receiptItems = bill.getItems().stream()
                .map(item -> new ThermalReceiptResponse.ThermalReceiptItem(
                        item.getItemName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList());

        receipt.setItems(receiptItems);
        receipt.setSubtotal(bill.getSubtotal());
        receipt.setDiscountAmount(bill.getDiscountAmount());
        receipt.setTaxRate(bill.getTaxRate());
        receipt.setTotalTax(bill.getTotalTax());
        receipt.setGrandTotal(bill.getGrandTotal());
        receipt.setPaymentMethod(bill.getPaymentMethod().name());

        if (settings.getUpiId() != null && !settings.getUpiId().trim().isEmpty()) {
            receipt.setUpiQrString("upi://pay?pa=" + settings.getUpiId() + "&pn=" +
                    URLEncoder.encode(settings.getRestaurantName(), StandardCharsets.UTF_8) +
                    "&am=" + bill.getGrandTotal() + "&cu=INR");
        }

        receipt.setFooterText("Thank you for visiting The Station Stories! Please visit again.");
        receipt.setPrinterWidth(width != null && width.equalsIgnoreCase("58mm") ? "58mm" : "80mm");
        return receipt;
    }

    public BillResponse mapToResponse(Bill bill, RestaurantSetting settings) {
        BillResponse res = new BillResponse();
        res.setId(bill.getId());
        res.setBillNumber(bill.getBillNumber());
        res.setInvoiceUuid(bill.getInvoiceUuid());
        res.setOrderType(bill.getOrderType());
        res.setCabinTableRef(bill.getCabinTableRef());
        res.setCustomerId(bill.getCustomer() != null ? bill.getCustomer().getId() : null);
        res.setCustomerName(bill.getCustomerNameSnapshot());
        res.setCustomerPhone(bill.getCustomerPhoneSnapshot());
        res.setCashierId(bill.getCashier() != null ? bill.getCashier().getId() : null);
        res.setCashierName(bill.getCashier() != null ? bill.getCashier().getFullName() : null);
        res.setPaymentMethod(bill.getPaymentMethod());
        res.setSubtotal(bill.getSubtotal());
        res.setDiscountType(bill.getDiscountType());
        res.setDiscountValue(bill.getDiscountValue());
        res.setDiscountAmount(bill.getDiscountAmount());
        res.setTaxRate(bill.getTaxRate());
        res.setCgstAmount(bill.getCgstAmount());
        res.setSgstAmount(bill.getSgstAmount());
        res.setTotalTax(bill.getTotalTax());
        res.setGrandTotal(bill.getGrandTotal());
        res.setPaymentStatus(bill.getPaymentStatus());
        res.setCancellationReason(bill.getCancellationReason());
        res.setCancelledByName(bill.getCancelledBy() != null ? bill.getCancelledBy().getFullName() : null);
        res.setCancelledAt(bill.getCancelledAt());
        res.setRefundAmount(bill.getRefundAmount());
        res.setWhatsappDeliveryStatus(bill.getWhatsappDeliveryStatus());
        res.setWhatsappSentAt(bill.getWhatsappSentAt());
        res.setNotes(bill.getNotes());
        res.setCreatedAt(bill.getCreatedAt());

        if (bill.getItems() != null) {
            List<BillItemResponse> itemResponses = bill.getItems().stream()
                    .map(item -> new BillItemResponse(
                            item.getId(),
                            item.getMenuItem() != null ? item.getMenuItem().getId() : null,
                            item.getItemName(),
                            item.getUnitPrice(),
                            item.getQuantity(),
                            item.getSubtotal(),
                            item.getNotes()
                    ))
                    .collect(Collectors.toList());
            res.setItems(itemResponses);
        }

        String publicUrl = publicBaseUrl + "/bill/view/" + bill.getInvoiceUuid();
        res.setPublicInvoiceUrl(publicUrl);

        if (bill.getCustomerPhoneSnapshot() != null && !bill.getCustomerPhoneSnapshot().trim().isEmpty()) {
            String message = String.format("Hello %s, thank you for visiting The Station Stories! Your bill #%s for ₹%s is ready. View your digital invoice here: %s",
                    bill.getCustomerNameSnapshot(), bill.getBillNumber(), bill.getGrandTotal(), publicUrl);
            String encodedText = URLEncoder.encode(message, StandardCharsets.UTF_8);
            res.setWhatsAppShareUrl("https://wa.me/91" + bill.getCustomerPhoneSnapshot() + "?text=" + encodedText);
        }

        return res;
    }
}
