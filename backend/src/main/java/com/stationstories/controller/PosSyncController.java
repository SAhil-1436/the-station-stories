package com.stationstories.controller;

import com.stationstories.dto.pos.SyncBillRequest;
import com.stationstories.dto.pos.SyncBillResponse;
import com.stationstories.entity.User;
import com.stationstories.service.PosSyncService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pos/sync")
public class PosSyncController {

    private final PosSyncService posSyncService;

    public PosSyncController(PosSyncService posSyncService) {
        this.posSyncService = posSyncService;
    }

    /**
     * Synchronizes a single offline bill.
     */
    @PostMapping("/bills")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<SyncBillResponse> syncSingleBill(
            @Valid @RequestBody SyncBillRequest request,
            @AuthenticationPrincipal User cashier) {
        SyncBillResponse response = posSyncService.syncSingleBill(request, cashier);
        return ResponseEntity.ok(response);
    }

    /**
     * Synchronizes a batch of offline bills.
     */
    @PostMapping("/bills/batch")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<List<SyncBillResponse>> syncBatchBills(
            @Valid @RequestBody List<SyncBillRequest> requests,
            @AuthenticationPrincipal User cashier) {
        List<SyncBillResponse> responses = posSyncService.syncBatch(requests, cashier);
        return ResponseEntity.ok(responses);
    }
}
