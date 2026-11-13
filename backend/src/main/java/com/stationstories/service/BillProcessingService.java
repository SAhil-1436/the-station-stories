package com.stationstories.service;

import com.stationstories.dto.bill.BillItemRequest;
import com.stationstories.dto.bill.CreateBillRequest;
import com.stationstories.entity.*;
import com.stationstories.entity.enums.DiscountType;
import com.stationstories.entity.enums.PaymentStatus;
import com.stationstories.exception.BusinessException;
import com.stationstories.exception.ResourceNotFoundException;
import com.stationstories.repository.BillNumberSequenceRepository;
import com.stationstories.repository.BillRepository;
import com.stationstories.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BillProcessingService {

    private static final Logger log = LoggerFactory.getLogger(BillProcessingService.class);

    private final BillRepository billRepository;
    private final BillNumberSequenceRepository sequenceRepository;
    private final MenuItemRepository menuItemRepository;
    private final CustomerService customerService;
    private final RestaurantSettingService settingService;
    private final AuditLogService auditLogService;

    public BillProcessingService(BillRepository billRepository,
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

    /**
     * Executes the authoritative bill creation transaction.
     * Annotated with @Transactional so that if any step fails, the entire transaction rolls back cleanly.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public Bill executeBillCreation(CreateBillRequest request,
                                    User cashier,
                                    String effectiveKey,
                                    String deviceId,
                                    String localBillReference,
                                    boolean isOfflineCreated,
                                    Instant syncedAt) {
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

            // For online live orders, check kitchen availability
            if (!isOfflineCreated && !menuItem.isAvailable()) {
                throw new BusinessException("Dish '" + menuItem.getName() + "' is currently out of stock and cannot be billed.");
            }

            int quantity = Math.max(1, itemReq.getQuantity());
            // Use snapshot price if offline created and valid, otherwise authoritative catalog price
            BigDecimal unitPrice;
            if (isOfflineCreated && itemReq.getUnitPriceSnapshot() != null && itemReq.getUnitPriceSnapshot().compareTo(BigDecimal.ZERO) > 0) {
                unitPrice = itemReq.getUnitPriceSnapshot().setScale(2, RoundingMode.HALF_UP);
            } else {
                unitPrice = menuItem.getPrice().setScale(2, RoundingMode.HALF_UP);
            }

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
        bill.setIdempotencyKey(effectiveKey);
        bill.setLocalBillReference(localBillReference);
        bill.setDeviceId(deviceId);
        bill.setIsOfflineCreated(isOfflineCreated);
        bill.setSyncedAt(syncedAt);
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
                null, (isOfflineCreated ? "[OFFLINE-SYNC] " : "") + "Created bill " + saved.getBillNumber() + " (Total: ₹" + saved.getGrandTotal() + ")", null);

        log.info("Generated Bill #{} with UUID {} for ₹{} (idempotencyKey={})",
                saved.getBillNumber(), saved.getInvoiceUuid(), saved.getGrandTotal(), effectiveKey);
        return saved;
    }
}
