package com.stationstories.service;

import com.stationstories.dto.pos.DeviceRegistrationRequest;
import com.stationstories.dto.pos.DeviceRegistrationResponse;
import com.stationstories.dto.pos.OfflineLeaseRequest;
import com.stationstories.dto.pos.OfflineLeaseResponse;
import com.stationstories.entity.PosDevice;
import com.stationstories.entity.User;
import com.stationstories.exception.BusinessException;
import com.stationstories.repository.PosDeviceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.junit.jupiter.api.io.TempDir;
import java.nio.file.Path;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PosDeviceServiceTest {

    @Mock
    private PosDeviceRepository posDeviceRepository;

    @Mock
    private PosKeyManagementService keyManagementService;

    @InjectMocks
    private PosDeviceService posDeviceService;

    private User cashier;
    private User admin;

    @BeforeEach
    void setUp() {
        cashier = new User("cashier1", "hash", "Cashier One", "9876543210", "CARD-1");
        cashier.setId(10L);

        admin = new User("admin", "hash", "Admin User", "9876543211", "CARD-0");
        admin.setId(1L);
    }

    @Test
    @DisplayName("registerDevice: creates and saves new device with unique ID")
    void testRegisterDevice() {
        when(posDeviceRepository.save(any(PosDevice.class))).thenAnswer(inv -> {
            PosDevice d = inv.getArgument(0);
            d.setId(100L);
            return d;
        });

        DeviceRegistrationResponse res = posDeviceService.registerDevice(new DeviceRegistrationRequest("Counter iPad 1"), cashier);

        assertThat(res).isNotNull();
        assertThat(res.getDeviceName()).isEqualTo("Counter iPad 1");
        assertThat(res.getDeviceId()).startsWith("DEV-");
        assertThat(res.getIsRevoked()).isFalse();
    }

    @Test
    @DisplayName("issueOfflineLease: issues 24h asymmetrically signed lease token")
    void testIssueOfflineLeaseSuccess() {
        String deviceId = "DEV-TEST-001";
        PosDevice device = new PosDevice(deviceId, "Main Counter", cashier);
        device.setId(50L);
        device.setIsRevoked(false);

        when(posDeviceRepository.findByDeviceId(deviceId)).thenReturn(Optional.of(device));
        when(posDeviceRepository.save(any(PosDevice.class))).thenReturn(device);
        when(keyManagementService.signPayload(anyString())).thenReturn("mockSignatureBase64");
        when(keyManagementService.getPublicKeySpkiBase64()).thenReturn("mockPublicKeySpkiBase64");

        OfflineLeaseResponse lease = posDeviceService.issueOfflineLease(new OfflineLeaseRequest(deviceId), cashier);

        assertThat(lease).isNotNull();
        assertThat(lease.getDeviceId()).isEqualTo(deviceId);
        assertThat(lease.getCashierId()).isEqualTo(cashier.getId());
        assertThat(lease.getLeaseToken()).contains(".");
        assertThat(lease.getPublicKeySpkiBase64()).isEqualTo("mockPublicKeySpkiBase64");
        assertThat(lease.getExpiresAt()).isAfter(lease.getIssuedAt());
    }

    @Test
    @DisplayName("issueOfflineLease: throws BusinessException when device is revoked")
    void testIssueOfflineLeaseRevokedDevice() {
        String deviceId = "DEV-REVOKED";
        PosDevice device = new PosDevice(deviceId, "Stolen Terminal", cashier);
        device.setId(51L);
        device.setIsRevoked(true);

        when(posDeviceRepository.findByDeviceId(deviceId)).thenReturn(Optional.of(device));

        assertThatThrownBy(() -> posDeviceService.issueOfflineLease(new OfflineLeaseRequest(deviceId), cashier))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("revoked by administration");
    }

    @Test
    @DisplayName("revokeDevice: marks device as revoked")
    void testRevokeDevice() {
        String deviceId = "DEV-TO-REVOKE";
        PosDevice device = new PosDevice(deviceId, "Old Tablet", cashier);
        device.setId(52L);
        device.setIsRevoked(false);

        when(posDeviceRepository.findByDeviceId(deviceId)).thenReturn(Optional.of(device));
        when(posDeviceRepository.save(any(PosDevice.class))).thenAnswer(inv -> inv.getArgument(0));

        DeviceRegistrationResponse res = posDeviceService.revokeDevice(deviceId, admin);

        assertThat(res.getIsRevoked()).isTrue();
    }

    @Test
    @DisplayName("issueOfflineLease: generates valid 3-part RS256 token with real key manager")
    void testIssueOfflineLeaseWithRealKeyManager(@TempDir Path tempDir) {
        PosKeyManagementService realKeyService = new PosKeyManagementService(tempDir.resolve("pos-keys").toString());
        realKeyService.init();

        PosDeviceService serviceWithRealKeys = new PosDeviceService(posDeviceRepository, realKeyService);
        String deviceId = "DEV-TEST-REAL";
        PosDevice device = new PosDevice(deviceId, "Counter POS", cashier);
        when(posDeviceRepository.findByDeviceId(deviceId)).thenReturn(Optional.of(device));
        when(posDeviceRepository.save(any(PosDevice.class))).thenReturn(device);

        OfflineLeaseResponse lease = serviceWithRealKeys.issueOfflineLease(new OfflineLeaseRequest(deviceId), cashier);
        assertThat(lease.getLeaseToken()).isNotNull();
        String[] parts = lease.getLeaseToken().split("\\.");
        assertThat(parts).hasSize(3);

        // Verify with real key manager
        String contentToSign = parts[0] + "." + parts[1];
        assertThat(realKeyService.verifySignature(contentToSign, parts[2])).isTrue();
    }
}
