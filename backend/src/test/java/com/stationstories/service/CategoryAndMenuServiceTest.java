package com.stationstories.service;

import com.stationstories.dto.menu.CategoryRequest;
import com.stationstories.dto.menu.CategoryResponse;
import com.stationstories.dto.menu.MenuItemResponse;
import com.stationstories.entity.Category;
import com.stationstories.entity.MenuItem;
import com.stationstories.entity.User;
import com.stationstories.exception.BusinessException;
import com.stationstories.repository.CategoryRepository;
import com.stationstories.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryAndMenuServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private CategoryService categoryService;

    @InjectMocks
    private MenuItemService menuItemService;

    private User testAdmin;
    private Category testCategory;
    private MenuItem testMenuItem;

    @BeforeEach
    void setUp() {
        testAdmin = new User("admin", "hash", "Admin Manager", "9876543210", "TSS-ADMIN-001");
        testAdmin.setId(1L);

        testCategory = new Category("Burgers", "बर्गर", 1, true, "Sandwich");
        testCategory.setId(10L);

        testMenuItem = new MenuItem(testCategory, "Veg Burger", "वेज बर्गर", "Delicious",
                BigDecimal.valueOf(89.00), true, true, null, false, 0, 1);
        testMenuItem.setId(100L);
    }

    @Test
    @DisplayName("Should prevent deletion of category if active menu items are linked to it")
    void testSafeCategoryDeletionRejection() {
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(testCategory));
        when(menuItemRepository.countByCategoryId(10L)).thenReturn(5L); // 5 linked items

        assertThatThrownBy(() -> categoryService.deleteCategory(10L, testAdmin))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cannot delete category 'Burgers' because 5 menu item(s) are associated with it");

        verify(categoryRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should allow safe deletion of category when zero menu items are linked")
    void testSafeCategoryDeletionSuccess() {
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(testCategory));
        when(menuItemRepository.countByCategoryId(10L)).thenReturn(0L); // 0 linked items

        categoryService.deleteCategory(10L, testAdmin);

        verify(categoryRepository, times(1)).delete(testCategory);
        verify(auditLogService, times(1)).recordEvent(eq("CATEGORY"), eq(10L), eq("CATEGORY_DELETED"), eq(testAdmin), any(), any(), any());
    }

    @Test
    @DisplayName("Should update menu item price and record an audit log event")
    void testUpdatePriceWithAuditLog() {
        when(menuItemRepository.findById(100L)).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MenuItemResponse updated = menuItemService.updatePrice(100L, BigDecimal.valueOf(99.00), testAdmin);

        assertThat(updated.getPrice()).isEqualByComparingTo("99.00");
        verify(auditLogService, times(1)).recordEvent(
                eq("MENU_ITEM"), eq(100L), eq("PRICE_CHANGED"), eq(testAdmin), eq("₹89.00"), eq("₹99.00"), any());
    }

    @Test
    @DisplayName("Should toggle menu item availability (in-stock / out-of-stock)")
    void testToggleAvailability() {
        when(menuItemRepository.findById(100L)).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThat(testMenuItem.isAvailable()).isTrue();

        MenuItemResponse response = menuItemService.toggleAvailability(100L, testAdmin);

        assertThat(response.isAvailable()).isFalse();
        verify(auditLogService, times(1)).recordEvent(
                eq("MENU_ITEM"), eq(100L), eq("AVAILABILITY_TOGGLED"), eq(testAdmin), eq("true"), eq("false"), any());
    }
}
