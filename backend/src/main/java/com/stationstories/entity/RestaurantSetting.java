package com.stationstories.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "restaurant_settings")
public class RestaurantSetting {

    @Id
    private Long id = 1L;

    @Column(name = "restaurant_name", nullable = false, length = 150)
    private String restaurantName = "THE STATION STORIES";

    @Column(length = 255)
    private String tagline = "Fast Food & Restaurant";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone_primary", nullable = false, length = 50)
    private String phonePrimary;

    @Column(name = "phone_secondary", length = 50)
    private String phoneSecondary;

    @Column(name = "whatsapp_number", nullable = false, length = 50)
    private String whatsappNumber;

    @Column(length = 120)
    private String email;

    @Column(name = "gst_enabled", nullable = false)
    private boolean gstEnabled = false;

    @Column(length = 25)
    private String gstin;

    @Column(name = "cgst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal cgstRate = BigDecimal.ZERO;

    @Column(name = "sgst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal sgstRate = BigDecimal.ZERO;

    @Column(name = "upi_id", length = 100)
    private String upiId;

    @Column(name = "currency_symbol", nullable = false, length = 10)
    private String currencySymbol = "₹";

    @Column(name = "opening_hours", nullable = false, length = 100)
    private String openingHours;

    @Column(name = "google_maps_url", columnDefinition = "TEXT")
    private String googleMapsUrl;

    @Column(name = "instagram_handle", length = 100)
    private String instagramHandle;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public RestaurantSetting() {}

    @PrePersist
    public void prePersist() {
        if (id == null) id = 1L;
        if (updatedAt == null) updatedAt = Instant.now();
        if (cgstRate == null) cgstRate = BigDecimal.ZERO;
        if (sgstRate == null) sgstRate = BigDecimal.ZERO;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isGstEnabled() {
        return gstEnabled;
    }

    public void setGstEnabled(boolean gstEnabled) {
        this.gstEnabled = gstEnabled;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public BigDecimal getCgstRate() {
        return cgstRate;
    }

    public void setCgstRate(BigDecimal cgstRate) {
        this.cgstRate = cgstRate;
    }

    public BigDecimal getSgstRate() {
        return sgstRate;
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
        return currencySymbol;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
