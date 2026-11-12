package com.stationstories.dto.menu;

public class GalleryImageResponse {
    private Long id;
    private String title;
    private String category;
    private String imageUrl;
    private int displayOrder;
    private boolean isActive;
    private boolean isOriginal;

    public GalleryImageResponse() {}

    public GalleryImageResponse(Long id, String title, String category, String imageUrl, int displayOrder, boolean isActive, boolean isOriginal) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
        this.isOriginal = isOriginal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public boolean isOriginal() {
        return isOriginal;
    }

    public void setOriginal(boolean original) {
        isOriginal = original;
    }
}
