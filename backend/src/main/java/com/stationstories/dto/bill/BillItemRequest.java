package com.stationstories.dto.bill;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class BillItemRequest {

    @NotNull(message = "Menu item ID is required")
    private Long menuItemId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;

    private String notes;

    public BillItemRequest() {}

    public BillItemRequest(Long menuItemId, int quantity, String notes) {
        this.menuItemId = menuItemId;
        this.quantity = quantity;
        this.notes = notes;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
