package com.stationstories.controller;

import com.stationstories.common.ApiResponse;
import com.stationstories.dto.audit.AuditLogResponse;
import com.stationstories.dto.auth.CreateStaffRequest;
import com.stationstories.dto.auth.UserDto;
import com.stationstories.dto.bill.BillResponse;
import com.stationstories.dto.bill.CancelBillRequest;
import com.stationstories.dto.menu.*;
import com.stationstories.dto.report.DashboardReportResponse;
import com.stationstories.dto.setting.RestaurantSettingRequest;
import com.stationstories.dto.setting.RestaurantSettingResponse;
import com.stationstories.entity.User;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.entity.enums.PaymentStatus;
import com.stationstories.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Management APIs", description = "Administrator-only operations: Menu CRUD, staff creation, bill cancellation, dynamic GST settings, reports, and compliance audit trail")
public class AdminController {

    private final AuthService authService;
    private final CategoryService categoryService;
    private final MenuItemService menuItemService;
    private final BillService billService;
    private final RestaurantSettingService settingService;
    private final ReportService reportService;
    private final AuditLogService auditLogService;
    private final ImageStorageService imageStorageService;

    public AdminController(AuthService authService,
                           CategoryService categoryService,
                           MenuItemService menuItemService,
                           BillService billService,
                           RestaurantSettingService settingService,
                           ReportService reportService,
                           AuditLogService auditLogService,
                           ImageStorageService imageStorageService) {
        this.authService = authService;
        this.categoryService = categoryService;
        this.menuItemService = menuItemService;
        this.billService = billService;
        this.settingService = settingService;
        this.reportService = reportService;
        this.auditLogService = auditLogService;
        this.imageStorageService = imageStorageService;
    }

    // --- Staff Management ---

    @PostMapping("/users/staff")
    @Operation(summary = "Create staff account", description = "Provisions a new cashier or staff account. Enforces mandatory company-card verification number.")
    public ResponseEntity<ApiResponse<UserDto>> createStaff(
            @Valid @RequestBody CreateStaffRequest request,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        UserDto staffDto = authService.createStaff(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Staff account created successfully", staffDto));
    }

    // --- Category Management ---

    @GetMapping("/categories")
    @Operation(summary = "Get all categories (including inactive)", description = "Returns full category catalog with dish count.")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategoriesAdmin();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", categories));
    }

    @PostMapping("/categories")
    @Operation(summary = "Create menu category", description = "Adds a new food category to the catalog.")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        CategoryResponse category = categoryService.createCategory(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Category created", category));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update menu category", description = "Updates category details, name, or display order.")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        CategoryResponse updated = categoryService.updateCategory(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Category updated", updated));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Safely delete menu category", description = "Deletes category only if no active menu items belong to it. Prevents accidental orphan dishes.")
    public ResponseEntity<ApiResponse<String>> deleteCategory(
            @PathVariable Long id,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        categoryService.deleteCategory(id, admin);
        return ResponseEntity.ok(ApiResponse.success("Category deleted safely", "Category ID " + id + " deleted"));
    }

    // --- Menu Item Management ---

    @GetMapping("/menu")
    @Operation(summary = "Get all menu items (including unavailable)", description = "Returns complete dish catalog.")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getAllMenuItems() {
        List<MenuItemResponse> menu = menuItemService.getAllMenuItemsAdmin();
        return ResponseEntity.ok(ApiResponse.success("Menu items retrieved", menu));
    }

    @PostMapping("/menu")
    @Operation(summary = "Create dish item", description = "Adds a new dish to the food catalog.")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        MenuItemResponse item = menuItemService.createMenuItem(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Menu item created", item));
    }

    @PutMapping("/menu/{id}")
    @Operation(summary = "Update dish item details", description = "Updates dish name, ingredients, or metadata. Never modifies historical bill snapshots.")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        MenuItemResponse updated = menuItemService.updateMenuItem(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Menu item updated", updated));
    }

    @PatchMapping("/menu/{id}/price")
    @Operation(summary = "Update dish price", description = "Updates catalog price and records an audit log event.")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updatePrice(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePriceRequest request,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        MenuItemResponse updated = menuItemService.updatePrice(id, request.getPrice(), admin);
        return ResponseEntity.ok(ApiResponse.success("Dish price updated", updated));
    }

    @PatchMapping("/menu/{id}/toggle-availability")
    @Operation(summary = "Toggle dish availability (in-stock/86 switch)", description = "Instantly enables or disables item availability on customer and POS menus.")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleAvailability(
            @PathVariable Long id,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        MenuItemResponse updated = menuItemService.toggleAvailability(id, admin);
        return ResponseEntity.ok(ApiResponse.success("Dish availability updated", updated));
    }

    @PostMapping(value = "/menu/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload dish photograph", description = "Uploads dish image to storage and updates item imageUrl.")
    public ResponseEntity<ApiResponse<MenuItemResponse>> uploadDishPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isOriginal", defaultValue = "false") boolean isOriginal,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        String storedUrl = imageStorageService.storeImage(file, "food");
        MenuItemResponse updated = menuItemService.updatePhoto(id, storedUrl, isOriginal, admin);
        return ResponseEntity.ok(ApiResponse.success("Dish photo uploaded", updated));
    }

    // --- Bill Management & Cancellation ---

    @GetMapping("/bills")
    @Operation(summary = "Search historical bills", description = "Paginated bill lookup filtered by payment status, payment method, or date range.")
    public ResponseEntity<ApiResponse<Page<BillResponse>>> getBills(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) PaymentMethod method,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ZoneId zone = ZoneId.of("Asia/Kolkata");
        Instant fromInstant = fromDate != null ? fromDate.atStartOfDay(zone).toInstant() : null;
        Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay(zone).toInstant() : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BillResponse> bills = billService.searchBills(status, method, fromInstant, toInstant, pageable);
        return ResponseEntity.ok(ApiResponse.success("Bills retrieved", bills));
    }

    @PostMapping("/bills/{id}/cancel")
    @Operation(summary = "Authoritative bill cancellation", description = "Cancels a finalized bill, records reason and refund amount. Preserves invoice record permanently in database.")
    public ResponseEntity<ApiResponse<BillResponse>> cancelBill(
            @PathVariable Long id,
            @Valid @RequestBody CancelBillRequest request,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        BillResponse cancelled = billService.cancelBill(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Bill cancelled successfully", cancelled));
    }

    // --- Financial Analytics & Reports ---

    @GetMapping("/reports/dashboard")
    @Operation(summary = "Get today's sales dashboard metrics", description = "Calculates today's gross sales, cash vs UPI breakdown, order counts, and top 5 bestsellers.")
    public ResponseEntity<ApiResponse<DashboardReportResponse>> getDashboardReport() {
        DashboardReportResponse report = reportService.getTodayDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", report));
    }

    // --- Settings & Dynamic Tax Controls ---

    @GetMapping("/settings")
    @Operation(summary = "Get restaurant settings", description = "Returns active restaurant settings including GST configuration.")
    public ResponseEntity<ApiResponse<RestaurantSettingResponse>> getSettings() {
        RestaurantSettingResponse settings = settingService.getSettingsResponse();
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved", settings));
    }

    @PutMapping("/settings")
    @Operation(summary = "Update restaurant settings & tax policy", description = "Updates restaurant information, UPI VPA, contact details, or dynamic GST toggle.")
    public ResponseEntity<ApiResponse<RestaurantSettingResponse>> updateSettings(
            @Valid @RequestBody RestaurantSettingRequest request,
            Authentication authentication) {
        User admin = authService.getUserEntity(authentication.getName());
        RestaurantSettingResponse updated = settingService.updateSettings(request, admin);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully", updated));
    }

    // --- Audit Logs ---

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit trail events", description = "Paginated list of system events: price changes, tax toggles, cancellations, and logins.")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogResponse> logs = auditLogService.getRecentAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }
}
