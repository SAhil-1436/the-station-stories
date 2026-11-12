package com.stationstories.dto.menu;

import java.math.BigDecimal;

public class MenuItemResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String hindiName;
    private String description;
    private BigDecimal price;
    private boolean isVeg;
    private boolean isAvailable;
    private String imageUrl;
    private boolean isOriginalImage;
    private int spiceLevel;
    private int displayOrder;

    public MenuItemResponse() {}

    public MenuItemResponse(Long id, Long categoryId, String categoryName, String name, String hindiName,
                            String description, BigDecimal price, boolean isVeg, boolean isAvailable,
                            String imageUrl, boolean isOriginalImage, int spiceLevel, int displayOrder) {
        this.id = id;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.name = name;
        this.hindiName = hindiName;
        this.description = description;
        this.price = price;
        this.isVeg = isVeg;
        this.isAvailable = isAvailable;
        this.imageUrl = imageUrl;
        this.isOriginalImage = isOriginalImage;
        this.spiceLevel = spiceLevel;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHindiName() {
        return hindiName;
    }

    public void setHindiName(String hindiName) {
        this.hindiName = hindiName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isVeg() {
        return isVeg;
    }

    public void setVeg(boolean veg) {
        isVeg = veg;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isOriginalImage() {
        return isOriginalImage;
    }

    public void setOriginalImage(boolean originalImage) {
        isOriginalImage = originalImage;
    }

    public int getSpiceLevel() {
        return spiceLevel;
    }

    public void setSpiceLevel(int spiceLevel) {
        this.spiceLevel = spiceLevel;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}
