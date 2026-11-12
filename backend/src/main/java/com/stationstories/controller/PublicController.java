package com.stationstories.controller;

import com.stationstories.common.ApiResponse;
import com.stationstories.dto.bill.BillResponse;
import com.stationstories.dto.menu.CategoryResponse;
import com.stationstories.dto.menu.GalleryImageResponse;
import com.stationstories.dto.menu.MenuItemResponse;
import com.stationstories.dto.setting.RestaurantSettingResponse;
import com.stationstories.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
@Tag(name = "Public Customer APIs", description = "Public-facing restaurant information, digital menu, photo gallery, and digital invoice viewer")
public class PublicController {

    private final RestaurantSettingService settingService;
    private final CategoryService categoryService;
    private final MenuItemService menuItemService;
    private final GalleryService galleryService;
    private final BillService billService;

    public PublicController(RestaurantSettingService settingService,
                            CategoryService categoryService,
                            MenuItemService menuItemService,
                            GalleryService galleryService,
                            BillService billService) {
        this.settingService = settingService;
        this.categoryService = categoryService;
        this.menuItemService = menuItemService;
        this.galleryService = galleryService;
        this.billService = billService;
    }

    @GetMapping("/restaurant-info")
    @Operation(summary = "Get restaurant brand details & timings", description = "Returns verified address, opening hours, contact details, and tax status.")
    public ResponseEntity<ApiResponse<RestaurantSettingResponse>> getRestaurantInfo() {
        RestaurantSettingResponse info = settingService.getSettingsResponse();
        return ResponseEntity.ok(ApiResponse.success("Restaurant information retrieved", info));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get active food menu categories", description = "Returns list of active food categories ordered by display sequence.")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        List<CategoryResponse> categories = categoryService.getPublicCategories();
        return ResponseEntity.ok(ApiResponse.success("Active categories retrieved", categories));
    }

    @GetMapping("/menu")
    @Operation(summary = "Get digital food menu", description = "Returns active menu items with optional category, vegetarian, and text search filters.")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenu(
            @RequestParam(required = false) @Parameter(description = "Filter by category ID") Long categoryId,
            @RequestParam(required = false) @Parameter(description = "Filter by vegetarian status") Boolean isVeg,
            @RequestParam(required = false) @Parameter(description = "Search by dish name or description") String search) {
        List<MenuItemResponse> menu = menuItemService.getPublicMenu(categoryId, isVeg, search);
        return ResponseEntity.ok(ApiResponse.success("Menu items retrieved", menu));
    }

    @GetMapping("/menu/{id}")
    @Operation(summary = "Get menu item details", description = "Returns full details for a single dish by ID.")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItem(@PathVariable Long id) {
        MenuItemResponse item = menuItemService.getMenuItemById(id);
        return ResponseEntity.ok(ApiResponse.success("Menu item details retrieved", item));
    }

    @GetMapping("/gallery")
    @Operation(summary = "Get restaurant gallery photographs", description = "Returns categorized authentic photographs of the restaurant.")
    public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> getGallery(
            @RequestParam(required = false) @Parameter(description = "Category: INTERIOR, ENTRANCE, SEATING, LIGHTING, DECOR, BRAND") String category) {
        List<GalleryImageResponse> gallery = galleryService.getGallery(category);
        return ResponseEntity.ok(ApiResponse.success("Gallery images retrieved", gallery));
    }

    @GetMapping("/bill/view/{uuid}")
    @Operation(summary = "View customer digital invoice", description = "Public read-only customer invoice endpoint protected by cryptographically secure UUIDv4.")
    public ResponseEntity<ApiResponse<BillResponse>> viewBill(
            @PathVariable @Parameter(description = "Cryptographically secure invoice UUID") String uuid) {
        BillResponse bill = billService.getBillByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Digital bill retrieved", bill));
    }
}
