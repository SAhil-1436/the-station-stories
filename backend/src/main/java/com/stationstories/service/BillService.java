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
import com.stationstories.repository.BillRepository;
import com.stationstories.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
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

    @Value("${app.public-url:http://localhost:5173}")
    private String publicBaseUrl;

    public BillService(BillRepository billRepository,
                       BillNumberSequenceRepository sequenceRepository,
                       MenuItemRepository menuItemRepository,
                       CustomerService customerService,
                       RestaurantSettingService settingService,
                       AuditLogService auditLogService) {
        this.billRepository = billRepository;
        this.sequenceRepository = sequenceRepository;
        this.menuItemRepository = menuItemRepository;
        this.customerService = customerService;
        this.settingService = settingService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public BillResponse createBill(CreateBillRequest request, User cashier) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("Cannot create an empty bill. At least one dish item is required.");
        }

        RestaurantSetting settings = settingService.getOrCreateSettings();

        // 1. Process items and validate availability on the backend
        List<BillItem> billItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (BillItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + itemReq.getMenuItemId()));

            if (!menuItem.isAvailable()) {
                throw new BusinessException("Dish '" + menuItem.getName() + "' is currently out of stock and cannot be billed.");
            }

            int quantity = Math.max(1, itemReq.getQuantity());
            BigDecimal unitPrice = menuItem.getPrice();
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);

            BillItem billItem = new BillItem();
            billItem.setMenuItem(menuItem);
            billItem.setItemName(menuItem.getName());
            billItem.setUnitPrice(unitPrice);
            billItem.setQuantity(quantity);
            billItem.setSubtotal(itemSubtotal);
            billItem.setNotes(itemReq.getNotes() != null ? itemReq.getNotes().trim() : null);

            billItems.add(billItem);
            subtotal = subtotal.add(itemSubtotal);
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);

        // 2. Authoritative backend discount calculation
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal discountValue = request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO;
        DiscountType discountType = request.getDiscountType() != null ? request.getDiscountType() : DiscountType.NONE;

        if (discountType == DiscountType.PERCENTAGE) {
            if (discountValue.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = subtotal.multiply(discountValue)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                discountAmount = discountAmount.min(subtotal);
            }
        } else if (discountType == DiscountType.FLAT) {
            if (discountValue.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = discountValue.min(subtotal).setScale(2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal taxableAmount = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);

        // 3. Authoritative backend GST tax calculation (Strictly 0.00% if gst_enabled = false)
        BigDecimal taxRate = BigDecimal.ZERO;
        BigDecimal cgstAmount = BigDecimal.ZERO;
        BigDecimal sgstAmount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        if (settings.isGstEnabled()) {
            BigDecimal cgstRate = settings.getCgstRate() != null ? settings.getCgstRate() : BigDecimal.ZERO;
            BigDecimal sgstRate = settings.getSgstRate() != null ? settings.getSgstRate() : BigDecimal.ZERO;
            taxRate = cgstRate.add(sgstRate);

            if (cgstRate.compareTo(BigDecimal.ZERO) > 0) {
                cgstAmount = taxableAmount.multiply(cgstRate)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            if (sgstRate.compareTo(BigDecimal.ZERO) > 0) {
                sgstAmount = taxableAmount.multiply(sgstRate)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            totalTax = cgstAmount.add(sgstAmount).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal grandTotal = taxableAmount.add(totalTax).setScale(2, RoundingMode.HALF_UP);

        // 4. Thread-Safe Atomic Daily Bill Number Generation
        LocalDate today = LocalDate.now();
        BillNumberSequence sequence = sequenceRepository.findBySequenceDateForUpdate(today)
                .orElseGet(() -> sequenceRepository.saveAndFlush(new BillNumberSequence(today, 0)));

        int seqNum = sequence.incrementAndGet();
        sequenceRepository.save(sequence);

        String billNumber = String.format("TSS-%s-%04d", today.format(DateTimeFormatter.ofPattern("yyyyMMdd")), seqNum);
        String invoiceUuid = UUID.randomUUID().toString();

        // 5. Construct and populate Bill entity
        Bill bill = new Bill();
        bill.setBillNumber(billNumber);
        bill.setInvoiceUuid(invoiceUuid);
        bill.setOrderType(request.getOrderType());
        bill.setCabinTableRef(request.getCabinTableRef() != null ? request.getCabinTableRef().trim() : null);
        bill.setCashier(cashier);
        bill.setPaymentMethod(request.getPaymentMethod());
        bill.setSubtotal(subtotal);
        bill.setDiscountType(discountType);
        bill.setDiscountValue(discountValue);
        bill.setDiscountAmount(discountAmount);
        bill.setTaxRate(taxRate);
        bill.setCgstAmount(cgstAmount);
        bill.setSgstAmount(sgstAmount);
        bill.setTotalTax(totalTax);
        bill.setGrandTotal(grandTotal);
        bill.setPaymentStatus(PaymentStatus.PAID);
        bill.setDeleted(false);
        bill.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        // 6. Handle Customer Association & Stats
        if (request.getCustomerPhone() != null && !request.getCustomerPhone().trim().isEmpty()) {
            Customer customer = customerService.findOrCreateCustomer(request.getCustomerPhone(), request.getCustomerName());
            customer.recordVisit(grandTotal);
            bill.setCustomer(customer);
            bill.setCustomerNameSnapshot(customer.getName());
            bill.setCustomerPhoneSnapshot(customer.getPhone());
        } else {
            bill.setCustomer(null);
            String walkInName = (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty())
                    ? request.getCustomerName().trim() : "Walk-in Customer";
            bill.setCustomerNameSnapshot(walkInName);
            bill.setCustomerPhoneSnapshot(null);
        }

        // Attach line items
        for (BillItem item : billItems) {
            bill.addItem(item);
        }

        // Attach initial payment record
        Payment payment = new Payment(bill, request.getPaymentMethod(), grandTotal, PaymentStatus.PAID, null);
        bill.addPayment(payment);

        Bill saved = billRepository.save(bill);

        auditLogService.recordEvent("BILL", saved.getId(), "BILL_CREATED", cashier,
                null, "Created bill " + saved.getBillNumber() + " (Total: ₹" + saved.getGrandTotal() + ")", null);

        log.info("Generated Bill #{} with UUID {} for ₹{}", saved.getBillNumber(), saved.getInvoiceUuid(), saved.getGrandTotal());
        return mapToResponse(saved, settings);
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
