package com.stationstories.dto.menu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class MenuItemRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Dish name is required")
    @Size(max = 150, message = "Dish name cannot exceed 150 characters")
    private String name;

    private String hindiName;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    private Boolean isVeg = true;

    private Boolean isAvailable = true;

    private String imageUrl;

    private Boolean isOriginalImage = false;

    private int spiceLevel = 0;

    private int displayOrder = 0;

    public MenuItemRequest() {}

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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

    public Boolean getIsVeg() {
        return isVeg != null ? isVeg : true;
    }

    public void setIsVeg(Boolean veg) {
        isVeg = veg;
    }

    public Boolean getIsAvailable() {
        return isAvailable != null ? isAvailable : true;
    }

    public void setIsAvailable(Boolean available) {
        isAvailable = available;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsOriginalImage() {
        return isOriginalImage != null ? isOriginalImage : false;
    }

    public void setIsOriginalImage(Boolean originalImage) {
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
