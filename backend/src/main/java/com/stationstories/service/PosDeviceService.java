package com.stationstories.service;

import com.stationstories.dto.pos.DeviceRegistrationRequest;
import com.stationstories.dto.pos.DeviceRegistrationResponse;
import com.stationstories.dto.pos.OfflineLeaseRequest;
import com.stationstories.dto.pos.OfflineLeaseResponse;
import com.stationstories.entity.PosDevice;
import com.stationstories.entity.User;
import com.stationstories.exception.BusinessException;
import com.stationstories.exception.ResourceNotFoundException;
import com.stationstories.repository.PosDeviceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PosDeviceService {

    private static final Logger log = LoggerFactory.getLogger(PosDeviceService.class);
    private static final long LEASE_DURATION_HOURS = 24L;

    private final PosDeviceRepository posDeviceRepository;
    private final PosKeyManagementService keyManagementService;

    public PosDeviceService(PosDeviceRepository posDeviceRepository,
                            PosKeyManagementService keyManagementService) {
        this.posDeviceRepository = posDeviceRepository;
        this.keyManagementService = keyManagementService;
    }

    @Transactional
    public DeviceRegistrationResponse registerDevice(DeviceRegistrationRequest request, User user) {
        String deviceId = "DEV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PosDevice device = new PosDevice(deviceId, request.getDeviceName().trim(), user);
        device.setLastSeenAt(Instant.now());
        PosDevice saved = posDeviceRepository.save(device);

        log.info("Registered new POS device '{}' (ID: {}) by user {}", saved.getDeviceName(), saved.getDeviceId(), user.getUsername());
        return mapToResponse(saved);
    }

    @Transactional
    public OfflineLeaseResponse issueOfflineLease(OfflineLeaseRequest request, User cashier) {
        PosDevice device = posDeviceRepository.findByDeviceId(request.getDeviceId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Registered POS device not found with ID: " + request.getDeviceId()));

        if (Boolean.TRUE.equals(device.getIsRevoked())) {
            log.warn("Device {} is revoked. Denying offline lease issuance to cashier {}", device.getDeviceId(), cashier.getUsername());
            throw new BusinessException("This device has been revoked by administration. Offline authorization cannot be granted.");
        }

        device.setLastSeenAt(Instant.now());
        posDeviceRepository.save(device);

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(LEASE_DURATION_HOURS, ChronoUnit.HOURS);
        String leaseId = UUID.randomUUID().toString();

        // Build standard compact JWS header (RS256)
        String headerJson = "{\"alg\":\"RS256\",\"typ\":\"POS-LEASE\"}";
        String headerBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));

        // Timestamps in Unix epoch milliseconds
        long issuedAtMs = issuedAt.toEpochMilli();
        long expiresAtMs = expiresAt.toEpochMilli();

        // Build canonical lease payload JSON
        String payloadJson = String.format(
                "{\"leaseId\":\"%s\",\"deviceId\":\"%s\",\"cashierId\":%d,\"cashierUsername\":\"%s\",\"cashierFullName\":\"%s\",\"issuedAt\":%d,\"expiresAt\":%d}",
                leaseId,
                device.getDeviceId(),
                cashier.getId(),
                escapeJson(cashier.getUsername()),
                escapeJson(cashier.getFullName() != null ? cashier.getFullName() : cashier.getUsername()),
                issuedAtMs,
                expiresAtMs
        );

        String payloadBase64 = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String contentToSign = headerBase64 + "." + payloadBase64;
        String signatureBase64 = keyManagementService.signPayload(contentToSign);
        String leaseToken = contentToSign + "." + signatureBase64;

        log.info("Issued 24h asymmetric offline lease for cashier {} on device {}", cashier.getUsername(), device.getDeviceId());

        return new OfflineLeaseResponse(
                leaseToken,
                device.getDeviceId(),
                cashier.getId(),
                cashier.getUsername(),
                cashier.getFullName(),
                issuedAt,
                expiresAt,
                keyManagementService.getPublicKeySpkiBase64()
        );
    }

    @Transactional(readOnly = true)
    public boolean isDeviceActive(String deviceId) {
        return posDeviceRepository.findByDeviceId(deviceId)
                .map(d -> !Boolean.TRUE.equals(d.getIsRevoked()))
                .orElse(false);
    }

    @Transactional
    public DeviceRegistrationResponse revokeDevice(String deviceId, User admin) {
        PosDevice device = posDeviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("POS Device not found: " + deviceId));

        device.setIsRevoked(true);
        device.setRevokedAt(Instant.now());
        PosDevice saved = posDeviceRepository.save(device);

        log.warn("Device {} revoked by administrator {}", deviceId, admin.getUsername());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DeviceRegistrationResponse> listAllDevices() {
        return posDeviceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DeviceRegistrationResponse mapToResponse(PosDevice d) {
        return new DeviceRegistrationResponse(
                d.getDeviceId(),
                d.getDeviceName(),
                d.getRegisteredBy() != null ? d.getRegisteredBy().getUsername() : null,
                d.getIsRevoked(),
                d.getCreatedAt()
        );
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
