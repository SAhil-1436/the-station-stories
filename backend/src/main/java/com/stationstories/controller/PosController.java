package com.stationstories.controller;

import com.stationstories.common.ApiResponse;
import com.stationstories.dto.bill.BillResponse;
import com.stationstories.dto.bill.CreateBillRequest;
import com.stationstories.dto.bill.ThermalReceiptResponse;
import com.stationstories.dto.bill.UpdateWhatsAppStatusRequest;
import com.stationstories.dto.customer.CustomerRequest;
import com.stationstories.dto.customer.CustomerResponse;
import com.stationstories.entity.User;
import com.stationstories.service.AuthService;
import com.stationstories.service.BillService;
import com.stationstories.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pos")
@Tag(name = "POS Billing & Counter APIs", description = "Point-of-Sale cashier terminal operations: customer lookup, atomic bill creation, thermal receipt formatting, and WhatsApp tracking")
public class PosController {

    private final BillService billService;
    private final CustomerService customerService;
    private final AuthService authService;

    public PosController(BillService billService,
                         CustomerService customerService,
                         AuthService authService) {
        this.billService = billService;
        this.customerService = customerService;
        this.authService = authService;
    }

    // --- Customer Management ---

    @GetMapping("/customers/lookup")
    @Operation(summary = "Lookup customer by phone number", description = "Searches customer directory by normalized 10-digit mobile number for returning loyalty tracking.")
    public ResponseEntity<ApiResponse<CustomerResponse>> lookupCustomer(
            @RequestParam @Parameter(description = "10-digit customer mobile number") String phone) {
        CustomerResponse customer = customerService.lookupByPhone(phone);
        return ResponseEntity.ok(ApiResponse.success("Customer found", customer));
    }

    @PostMapping("/customers")
    @Operation(summary = "Create customer profile", description = "Registers a new customer record.")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse customer = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Customer created", customer));
    }

    @GetMapping("/customers/{id}")
    @Operation(summary = "Get customer profile by ID", description = "Retrieves customer information and total lifetime spend.")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomer(@PathVariable Long id) {
        CustomerResponse customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success("Customer profile retrieved", customer));
    }

    @PutMapping("/customers/{id}")
    @Operation(summary = "Update customer profile", description = "Updates customer name, phone, or email.")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Customer profile updated", updated));
    }

    @GetMapping("/customers/{id}/purchase-history")
    @Operation(summary = "Get customer purchase history", description = "Returns all historical invoices associated with this customer.")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getCustomerPurchaseHistory(@PathVariable Long id) {
        List<BillResponse> bills = billService.getCustomerBills(id);
        return ResponseEntity.ok(ApiResponse.success("Customer purchase history retrieved", bills));
    }

    // --- Billing Operations ---

    @PostMapping("/bills")
    @Operation(summary = "Create and finalize POS bill", description = "Calculates authoritative totals, generates atomic thread-safe sequence number, freezes snapshots, and logs transaction.")
    public ResponseEntity<ApiResponse<BillResponse>> createBill(
            @Valid @RequestBody CreateBillRequest request,
            Authentication authentication) {
        User cashier = authService.getUserEntity(authentication.getName());
        BillResponse bill = billService.createBill(request, cashier);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Bill generated successfully", bill));
    }

    @GetMapping("/bills/{id}")
    @Operation(summary = "Get bill details by ID", description = "Retrieves full invoice data.")
    public ResponseEntity<ApiResponse<BillResponse>> getBill(@PathVariable Long id) {
        BillResponse bill = billService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.success("Bill details retrieved", bill));
    }

    @GetMapping("/bills/{id}/receipt")
    @Operation(summary = "Get formatted thermal receipt data", description = "Returns structured receipt payload with ESC/POS formatting guidelines for 80mm or 58mm printers.")
    public ResponseEntity<ApiResponse<ThermalReceiptResponse>> getThermalReceipt(
            @PathVariable Long id,
            @RequestParam(defaultValue = "80mm") @Parameter(description = "Receipt width: 80mm or 58mm") String width) {
        ThermalReceiptResponse receipt = billService.getThermalReceipt(id, width);
        return ResponseEntity.ok(ApiResponse.success("Thermal receipt generated", receipt));
    }

    @PatchMapping("/bills/{id}/whatsapp-status")
    @Operation(summary = "Update bill WhatsApp delivery status", description = "Tracks digital invoice delivery state machine (LINK_PREPARED, OPENED, MANUALLY_SENT, DELIVERY_CONFIRMED).")
    public ResponseEntity<ApiResponse<BillResponse>> updateWhatsAppStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWhatsAppStatusRequest request,
            Authentication authentication) {
        User user = authService.getUserEntity(authentication.getName());
        BillResponse bill = billService.updateWhatsAppStatus(id, request.getStatus(), user);
        return ResponseEntity.ok(ApiResponse.success("WhatsApp status updated", bill));
    }
}
