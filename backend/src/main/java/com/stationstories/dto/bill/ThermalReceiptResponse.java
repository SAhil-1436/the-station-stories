package com.stationstories.dto.bill;

import java.math.BigDecimal;
import java.util.List;

public class ThermalReceiptResponse {
    private String restaurantName;
    private String tagline;
    private String address;
    private String phone;
    private String gstin;
    private String billNumber;
    private String date;
    private String time;
    private String orderType;
    private String cabinTableRef;
    private String customerName;
    private String cashierName;
    private List<ThermalReceiptItem> items;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxRate;
    private BigDecimal totalTax;
    private BigDecimal grandTotal;
    private String paymentMethod;
    private String upiQrString;
    private String footerText;
    private String printerWidth; // "80mm" or "58mm"

    public ThermalReceiptResponse() {}

    public static class ThermalReceiptItem {
        private String name;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;

        public ThermalReceiptItem() {}

        public ThermalReceiptItem(String name, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {
            this.name = name;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.subtotal = subtotal;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }

        public BigDecimal getSubtotal() {
            return subtotal;
        }

        public void setSubtotal(BigDecimal subtotal) {
            this.subtotal = subtotal;
        }
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getCabinTableRef() {
        return cabinTableRef;
    }

    public void setCabinTableRef(String cabinTableRef) {
        this.cabinTableRef = cabinTableRef;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCashierName() {
        return cashierName;
    }

    public void setCashierName(String cashierName) {
        this.cashierName = cashierName;
    }

    public List<ThermalReceiptItem> getItems() {
        return items;
    }

    public void setItems(List<ThermalReceiptItem> items) {
        this.items = items;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
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

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getUpiQrString() {
        return upiQrString;
    }

    public void setUpiQrString(String upiQrString) {
        this.upiQrString = upiQrString;
    }

    public String getFooterText() {
        return footerText;
    }

    public void setFooterText(String footerText) {
        this.footerText = footerText;
    }

    public String getPrinterWidth() {
        return printerWidth;
    }

    public void setPrinterWidth(String printerWidth) {
        this.printerWidth = printerWidth;
    }
}
