package com.stationstories.dto.bill;

import com.stationstories.entity.enums.DiscountType;
import com.stationstories.entity.enums.OrderType;
import com.stationstories.entity.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class CreateBillRequest {

    @NotNull(message = "Order type is required")
    private OrderType orderType = OrderType.DINE_IN;

    private String cabinTableRef;

    private String customerPhone;

    private String customerName;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    private DiscountType discountType = DiscountType.NONE;

    private BigDecimal discountValue = BigDecimal.ZERO;

    private String notes;

    @NotEmpty(message = "At least one item is required in the bill")
    @Valid
    private List<BillItemRequest> items;

    public CreateBillRequest() {}

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

    public DiscountType getDiscountType() {
        return discountType != null ? discountType : DiscountType.NONE;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue != null ? discountValue : BigDecimal.ZERO;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<BillItemRequest> getItems() {
        return items;
    }

    public void setItems(List<BillItemRequest> items) {
        this.items = items;
    }
}
