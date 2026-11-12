package com.stationstories.dto.setting;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class RestaurantSettingRequest {

    @NotBlank(message = "Restaurant name is required")
    private String restaurantName;

    private String tagline;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Primary phone number is required")
    private String phonePrimary;

    private String phoneSecondary;

    @NotBlank(message = "WhatsApp number is required")
    private String whatsappNumber;

    private String email;

    private Boolean gstEnabled = false;

    private String gstin;

    @DecimalMin(value = "0.00", message = "CGST rate cannot be negative")
    private BigDecimal cgstRate = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "SGST rate cannot be negative")
    private BigDecimal sgstRate = BigDecimal.ZERO;

    private String upiId;

    private String currencySymbol = "₹";

    @NotBlank(message = "Opening hours are required")
    private String openingHours;

    private String googleMapsUrl;

    private String instagramHandle;

    public RestaurantSettingRequest() {}

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

    public String getPhonePrimary() {
        return phonePrimary;
    }

    public void setPhonePrimary(String phonePrimary) {
        this.phonePrimary = phonePrimary;
    }

    public String getPhoneSecondary() {
        return phoneSecondary;
    }

    public void setPhoneSecondary(String phoneSecondary) {
        this.phoneSecondary = phoneSecondary;
    }

    public String getWhatsappNumber() {
        return whatsappNumber;
    }

    public void setWhatsappNumber(String whatsappNumber) {
        this.whatsappNumber = whatsappNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getGstEnabled() {
        return gstEnabled != null ? gstEnabled : false;
    }

    public void setGstEnabled(Boolean gstEnabled) {
        this.gstEnabled = gstEnabled;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public BigDecimal getCgstRate() {
        return cgstRate != null ? cgstRate : BigDecimal.ZERO;
    }

    public void setCgstRate(BigDecimal cgstRate) {
        this.cgstRate = cgstRate;
    }

    public BigDecimal getSgstRate() {
        return sgstRate != null ? sgstRate : BigDecimal.ZERO;
    }

    public void setSgstRate(BigDecimal sgstRate) {
        this.sgstRate = sgstRate;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getCurrencySymbol() {
        return currencySymbol != null ? currencySymbol : "₹";
    }

    public void setCurrencySymbol(String currencySymbol) {
        this.currencySymbol = currencySymbol;
    }

    public String getOpeningHours() {
        return openingHours;
    }

    public void setOpeningHours(String openingHours) {
        this.openingHours = openingHours;
    }

    public String getGoogleMapsUrl() {
        return googleMapsUrl;
    }

    public void setGoogleMapsUrl(String googleMapsUrl) {
        this.googleMapsUrl = googleMapsUrl;
    }

    public String getInstagramHandle() {
        return instagramHandle;
    }

    public void setInstagramHandle(String instagramHandle) {
        this.instagramHandle = instagramHandle;
    }
}
