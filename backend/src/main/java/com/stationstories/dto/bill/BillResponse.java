package com.stationstories.dto.bill;

import com.stationstories.entity.enums.DiscountType;
import com.stationstories.entity.enums.OrderType;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.entity.enums.PaymentStatus;
import com.stationstories.entity.enums.WhatsAppDeliveryStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class BillResponse {
    private Long id;
    private String billNumber;
    private String invoiceUuid;
    private OrderType orderType;
    private String cabinTableRef;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long cashierId;
    private String cashierName;
    private PaymentMethod paymentMethod;
    private BigDecimal subtotal;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal taxRate;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal totalTax;
    private BigDecimal grandTotal;
    private PaymentStatus paymentStatus;
    private String cancellationReason;
    private String cancelledByName;
    private Instant cancelledAt;
    private BigDecimal refundAmount;
    private WhatsAppDeliveryStatus whatsappDeliveryStatus;
    private Instant whatsappSentAt;
    private String notes;
    private Instant createdAt;
    private List<BillItemResponse> items;
    private String publicInvoiceUrl;
    private String whatsAppShareUrl;

    public BillResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public String getInvoiceUuid() {
        return invoiceUuid;
    }

    public void setInvoiceUuid(String invoiceUuid) {
        this.invoiceUuid = invoiceUuid;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(OrderType orderType) {
        this.orderType = orderType;
    }

    public String getCabinTableRef() {
        return cabinTableRef;
    }

    public void setCabinTableRef(String cabinTableRef) {
        this.cabinTableRef = cabinTableRef;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Long getCashierId() {
        return cashierId;
    }

    public void setCashierId(Long cashierId) {
        this.cashierId = cashierId;
    }

    public String getCashierName() {
        return cashierName;
    }

    public void setCashierName(String cashierName) {
        this.cashierName = cashierName;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }

    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }

    public void setCgstAmount(BigDecimal cgstAmount) {
        this.cgstAmount = cgstAmount;
    }

    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }

    public void setSgstAmount(BigDecimal sgstAmount) {
        this.sgstAmount = sgstAmount;
    }

    public BigDecimal getTotalTax() {
        return totalTax;
    }

    public void setTotalTax(BigDecimal totalTax) {
        this.totalTax = totalTax;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getCancelledByName() {
        return cancelledByName;
    }

    public void setCancelledByName(String cancelledByName) {
        this.cancelledByName = cancelledByName;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Instant cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public WhatsAppDeliveryStatus getWhatsappDeliveryStatus() {
        return whatsappDeliveryStatus;
    }

    public void setWhatsappDeliveryStatus(WhatsAppDeliveryStatus whatsappDeliveryStatus) {
        this.whatsappDeliveryStatus = whatsappDeliveryStatus;
    }

    public Instant getWhatsappSentAt() {
        return whatsappSentAt;
    }

    public void setWhatsappSentAt(Instant whatsappSentAt) {
        this.whatsappSentAt = whatsappSentAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<BillItemResponse> getItems() {
        return items;
    }

    public void setItems(List<BillItemResponse> items) {
        this.items = items;
    }

    public String getPublicInvoiceUrl() {
        return publicInvoiceUrl;
    }

    public void setPublicInvoiceUrl(String publicInvoiceUrl) {
        this.publicInvoiceUrl = publicInvoiceUrl;
    }

    public String getWhatsAppShareUrl() {
        return whatsAppShareUrl;
    }

    public void setWhatsAppShareUrl(String whatsAppShareUrl) {
        this.whatsAppShareUrl = whatsAppShareUrl;
    }
}
