package com.stationstories.controller;

import com.stationstories.dto.pos.OfflineLeaseRequest;
import com.stationstories.dto.pos.OfflineLeaseResponse;
import com.stationstories.entity.User;
import com.stationstories.service.PosDeviceService;
import com.stationstories.service.PosKeyManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/pos/auth")
public class PosAuthController {

    private final PosDeviceService posDeviceService;
    private final PosKeyManagementService keyManagementService;

    public PosAuthController(PosDeviceService posDeviceService,
                             PosKeyManagementService keyManagementService) {
        this.posDeviceService = posDeviceService;
        this.keyManagementService = keyManagementService;
    }

    /**
     * Issues a 24-hour device-bound offline authorization lease asymmetrically signed with RSA private key.
     */
    @PostMapping("/offline-lease")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<OfflineLeaseResponse> issueOfflineLease(
            @Valid @RequestBody OfflineLeaseRequest request,
            @AuthenticationPrincipal User cashier) {
        OfflineLeaseResponse response = posDeviceService.issueOfflineLease(request, cashier);
        return ResponseEntity.ok(response);
    }

    /**
     * Returns the RSA public key (SPKI Base64 and PEM) used by the frontend PWA to verify offline leases.
     * The private key remains secure on the backend.
     */
    @GetMapping("/public-key")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        String spki = keyManagementService.getPublicKeySpkiBase64();
        return ResponseEntity.ok(Map.of(
                "algorithm", "RSA",
                "format", "X.509/SPKI",
                "hash", "SHA-256",
                "publicKey", spki,
                "spkiBase64", spki,
                "publicKeySpkiBase64", spki,
                "pem", keyManagementService.getPublicKeyPem()
        ));
    }
}
