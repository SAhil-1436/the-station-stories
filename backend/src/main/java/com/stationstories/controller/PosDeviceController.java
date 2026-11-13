package com.stationstories.controller;

import com.stationstories.dto.pos.DeviceRegistrationRequest;
import com.stationstories.dto.pos.DeviceRegistrationResponse;
import com.stationstories.entity.User;
import com.stationstories.service.PosDeviceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pos/devices")
public class PosDeviceController {

    private final PosDeviceService posDeviceService;

    public PosDeviceController(PosDeviceService posDeviceService) {
        this.posDeviceService = posDeviceService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<DeviceRegistrationResponse> registerDevice(
            @Valid @RequestBody DeviceRegistrationRequest request,
            @AuthenticationPrincipal User user) {
        DeviceRegistrationResponse response = posDeviceService.registerDevice(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{deviceId}")
    @PreAuthorize("hasAnyAuthority('ROLE_CASHIER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getDeviceStatus(@PathVariable String deviceId) {
        boolean active = posDeviceService.isDeviceActive(deviceId);
        return ResponseEntity.ok(Map.of("deviceId", deviceId, "active", active));
    }

    @PostMapping("/{deviceId}/revoke")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DeviceRegistrationResponse> revokeDevice(
            @PathVariable String deviceId,
            @AuthenticationPrincipal User admin) {
        DeviceRegistrationResponse response = posDeviceService.revokeDevice(deviceId, admin);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<DeviceRegistrationResponse>> listDevices() {
        return ResponseEntity.ok(posDeviceService.listAllDevices());
    }
}
