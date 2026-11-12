package com.stationstories.dto.menu;

public class CategoryResponse {
    private Long id;
    private String name;
    private String hindiName;
    private int displayOrder;
    private boolean isActive;
    private String iconName;
    private long itemCount;

    public CategoryResponse() {}

    public CategoryResponse(Long id, String name, String hindiName, int displayOrder, boolean isActive, String iconName, long itemCount) {
        this.id = id;
        this.name = name;
        this.hindiName = hindiName;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
        this.iconName = iconName;
        this.itemCount = itemCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(boolean active) {
        isActive = active;
    }

    public String getIconName() {
        return iconName;
    }

    public void setIconName(String iconName) {
        this.iconName = iconName;
    }

    public long getItemCount() {
        return itemCount;
    }

    public void setItemCount(long itemCount) {
        this.itemCount = itemCount;
    }
}
