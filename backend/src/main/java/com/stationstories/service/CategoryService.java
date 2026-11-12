package com.stationstories.service;

import com.stationstories.dto.menu.CategoryRequest;
import com.stationstories.dto.menu.CategoryResponse;
import com.stationstories.entity.Category;
import com.stationstories.entity.User;
import com.stationstories.exception.BusinessException;
import com.stationstories.exception.ResourceNotFoundException;
import com.stationstories.repository.CategoryRepository;
import com.stationstories.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final AuditLogService auditLogService;

    public CategoryService(CategoryRepository categoryRepository,
                           MenuItemRepository menuItemRepository,
                           AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getPublicCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(cat -> {
                    long itemCount = menuItemRepository.countByCategoryIdAndIsAvailableTrue(cat.getId());
                    return mapToResponse(cat, itemCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesAdmin() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(cat -> {
                    long itemCount = menuItemRepository.countByCategoryId(cat.getId());
                    return mapToResponse(cat, itemCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        long itemCount = menuItemRepository.countByCategoryId(id);
        return mapToResponse(category, itemCount);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, User admin) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BusinessException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setHindiName(request.getHindiName() != null ? request.getHindiName().trim() : null);
        category.setDisplayOrder(request.getDisplayOrder());
        category.setActive(request.getIsActive());
        category.setIconName(request.getIconName() != null ? request.getIconName().trim() : null);

        Category saved = categoryRepository.save(category);
        auditLogService.recordEvent("CATEGORY", saved.getId(), "CATEGORY_CREATED", admin, null, saved.getName(), null);

        return mapToResponse(saved, 0);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, User admin) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (!category.getName().equalsIgnoreCase(request.getName().trim())) {
            if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
                throw new BusinessException("Another category with name '" + request.getName() + "' already exists");
            }
        }

        String oldVal = category.getName() + " (Active: " + category.isActive() + ")";
        category.setName(request.getName().trim());
        category.setHindiName(request.getHindiName() != null ? request.getHindiName().trim() : null);
        category.setDisplayOrder(request.getDisplayOrder());
        category.setActive(request.getIsActive());
        category.setIconName(request.getIconName() != null ? request.getIconName().trim() : null);

        Category updated = categoryRepository.save(category);
        String newVal = updated.getName() + " (Active: " + updated.isActive() + ")";
        auditLogService.recordEvent("CATEGORY", updated.getId(), "CATEGORY_UPDATED", admin, oldVal, newVal, null);

        long itemCount = menuItemRepository.countByCategoryId(id);
        return mapToResponse(updated, itemCount);
    }

    @Transactional
    public void deleteCategory(Long id, User admin) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        long linkedItems = menuItemRepository.countByCategoryId(id);
        if (linkedItems > 0) {
            throw new BusinessException("Cannot delete category '" + category.getName() + "' because " + linkedItems +
                    " menu item(s) are associated with it. Please reassign or delete the items first.");
        }

        categoryRepository.delete(category);
        auditLogService.recordEvent("CATEGORY", id, "CATEGORY_DELETED", admin, category.getName(), null, null);
    }

    private CategoryResponse mapToResponse(Category cat, long itemCount) {
        return new CategoryResponse(
                cat.getId(),
                cat.getName(),
                cat.getHindiName(),
                cat.getDisplayOrder(),
                cat.isActive(),
                cat.getIconName(),
                itemCount
        );
    }
}
