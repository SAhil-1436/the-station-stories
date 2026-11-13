package com.stationstories.dto.pos;

import com.stationstories.dto.bill.BillItemRequest;
import com.stationstories.entity.enums.OrderType;
import com.stationstories.entity.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class SyncBillRequest {

    @NotBlank(message = "Client operation UUID is required")
    private String clientOperationUuid;

    @NotBlank(message = "Local provisional bill reference is required")
    private String localBillReference;

    private String deviceId;

    @NotNull(message = "Order type is required")
    private OrderType orderType = OrderType.DINE_IN;

    private String cabinTableRef;

    private String customerPhone;

    private String customerName;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    private BigDecimal cashTendered;

    private BigDecimal changeAmount;

    private String notes;

    private Instant offlineCreatedAt;

    @NotEmpty(message = "At least one item is required in the bill")
    @Valid
    private List<BillItemRequest> items;

    public SyncBillRequest() {}

    public String getClientOperationUuid() {
        return clientOperationUuid;
    }

    public void setClientOperationUuid(String clientOperationUuid) {
        this.clientOperationUuid = clientOperationUuid;
    }

    public String getLocalBillReference() {
        return localBillReference;
    }

    public void setLocalBillReference(String localBillReference) {
        this.localBillReference = localBillReference;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public OrderType getOrderType() {
        return orderType != null ? orderType : OrderType.DINE_IN;
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

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod != null ? paymentMethod : PaymentMethod.CASH;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getCashTendered() {
        return cashTendered;
    }

    public void setCashTendered(BigDecimal cashTendered) {
        this.cashTendered = cashTendered;
    }

    public BigDecimal getChangeAmount() {
        return changeAmount;
    }

    public void setChangeAmount(BigDecimal changeAmount) {
        this.changeAmount = changeAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getOfflineCreatedAt() {
        return offlineCreatedAt;
    }

    public void setOfflineCreatedAt(Instant offlineCreatedAt) {
        this.offlineCreatedAt = offlineCreatedAt;
    }

    public List<BillItemRequest> getItems() {
        return items;
    }

    public void setItems(List<BillItemRequest> items) {
        this.items = items;
    }
}
