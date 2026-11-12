package com.stationstories.service;

import com.stationstories.dto.menu.MenuItemRequest;
import com.stationstories.dto.menu.MenuItemResponse;
import com.stationstories.entity.Category;
import com.stationstories.entity.MenuItem;
import com.stationstories.entity.User;
import com.stationstories.exception.BusinessException;
import com.stationstories.exception.ResourceNotFoundException;
import com.stationstories.repository.CategoryRepository;
import com.stationstories.repository.MenuItemRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public MenuItemService(MenuItemRepository menuItemRepository,
                           CategoryRepository categoryRepository,
                           AuditLogService auditLogService) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getPublicMenu(Long categoryId, Boolean isVeg, String search) {
        Sort sort = Sort.by(Sort.Direction.ASC, "displayOrder").and(Sort.by(Sort.Direction.ASC, "name"));
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return menuItemRepository.searchPublicMenu(categoryId, isVeg, searchParam, sort).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAllMenuItemsAdmin() {
        Sort sort = Sort.by(Sort.Direction.ASC, "category.displayOrder")
                .and(Sort.by(Sort.Direction.ASC, "displayOrder"));
        return menuItemRepository.findAll(sort).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));
        return mapToResponse(item);
    }

    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request, User admin) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        MenuItem item = new MenuItem();
        item.setCategory(category);
        item.setName(request.getName().trim());
        item.setHindiName(request.getHindiName() != null ? request.getHindiName().trim() : null);
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        item.setPrice(request.getPrice());
        item.setVeg(request.getIsVeg());
        item.setAvailable(request.getIsAvailable());
        item.setImageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null);
        item.setOriginalImage(request.getIsOriginalImage());
        item.setSpiceLevel(request.getSpiceLevel());
        item.setDisplayOrder(request.getDisplayOrder());

        MenuItem saved = menuItemRepository.save(item);
        auditLogService.recordEvent("MENU_ITEM", saved.getId(), "MENU_ITEM_CREATED", admin, null,
                saved.getName() + " (₹" + saved.getPrice() + ")", null);

        return mapToResponse(saved);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request, User admin) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        String oldVal = item.getName() + " (Price: ₹" + item.getPrice() + ", Available: " + item.isAvailable() + ")";

        item.setCategory(category);
        item.setName(request.getName().trim());
        item.setHindiName(request.getHindiName() != null ? request.getHindiName().trim() : null);
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        item.setPrice(request.getPrice());
        item.setVeg(request.getIsVeg());
        item.setAvailable(request.getIsAvailable());
        item.setImageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null);
        item.setOriginalImage(request.getIsOriginalImage());
        item.setSpiceLevel(request.getSpiceLevel());
        item.setDisplayOrder(request.getDisplayOrder());

        MenuItem updated = menuItemRepository.save(item);
        String newVal = updated.getName() + " (Price: ₹" + updated.getPrice() + ", Available: " + updated.isAvailable() + ")";
        auditLogService.recordEvent("MENU_ITEM", updated.getId(), "MENU_ITEM_UPDATED", admin, oldVal, newVal, null);

        return mapToResponse(updated);
    }

    @Transactional
    public MenuItemResponse updatePrice(Long id, BigDecimal newPrice, User admin) {
        if (newPrice == null || newPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Dish price must be greater than zero");
        }

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        BigDecimal oldPrice = item.getPrice();
        item.setPrice(newPrice);
        MenuItem updated = menuItemRepository.save(item);

        auditLogService.recordEvent("MENU_ITEM", updated.getId(), "PRICE_CHANGED", admin,
                "₹" + oldPrice.setScale(2, java.math.RoundingMode.HALF_UP),
                "₹" + newPrice.setScale(2, java.math.RoundingMode.HALF_UP), null);

        return mapToResponse(updated);
    }

    @Transactional
    public MenuItemResponse toggleAvailability(Long id, User admin) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        boolean oldStatus = item.isAvailable();
        item.setAvailable(!oldStatus);
        MenuItem updated = menuItemRepository.save(item);

        auditLogService.recordEvent("MENU_ITEM", updated.getId(), "AVAILABILITY_TOGGLED", admin,
                String.valueOf(oldStatus), String.valueOf(updated.isAvailable()), null);

        return mapToResponse(updated);
    }

    @Transactional
    public MenuItemResponse updatePhoto(Long id, String imageUrl, boolean isOriginal, User admin) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        String oldImage = item.getImageUrl();
        item.setImageUrl(imageUrl);
        item.setOriginalImage(isOriginal);
        MenuItem updated = menuItemRepository.save(item);

        auditLogService.recordEvent("MENU_ITEM", updated.getId(), "PHOTO_UPDATED", admin, oldImage, imageUrl, null);
        return mapToResponse(updated);
    }

    public MenuItemResponse mapToResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getName(),
                item.getHindiName(),
                item.getDescription(),
                item.getPrice(),
                item.isVeg(),
                item.isAvailable(),
                item.getImageUrl(),
                item.isOriginalImage(),
                item.getSpiceLevel(),
                item.getDisplayOrder()
        );
    }
}
