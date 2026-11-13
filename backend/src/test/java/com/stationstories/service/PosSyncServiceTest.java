package com.stationstories.service;

import com.stationstories.dto.bill.BillItemRequest;
import com.stationstories.dto.bill.BillResponse;
import com.stationstories.dto.bill.CreateBillRequest;
import com.stationstories.dto.pos.SyncBillRequest;
import com.stationstories.dto.pos.SyncBillResponse;
import com.stationstories.entity.Bill;
import com.stationstories.entity.RestaurantSetting;
import com.stationstories.entity.User;
import com.stationstories.entity.enums.OrderType;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.repository.BillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PosSyncServiceTest {

    @Mock
    private BillService billService;

    @Mock
    private BillRepository billRepository;

    @Mock
    private RestaurantSettingService settingService;

    @Mock
    private PosDeviceService posDeviceService;

    @InjectMocks
    private PosSyncService posSyncService;

    private User cashier;
    private RestaurantSetting defaultSettings;

    @BeforeEach
    void setUp() {
        cashier = new User("cashier1", "hash", "Cashier One", "9876543210", "CARD-1");
        cashier.setId(10L);

        defaultSettings = new RestaurantSetting();
        defaultSettings.setRestaurantName("THE STATION STORIES");
        when(settingService.getOrCreateSettings()).thenReturn(defaultSettings);
        when(posDeviceService.isDeviceActive(anyString())).thenReturn(true);
    }

    private SyncBillRequest buildSyncRequest(String uuid, String localRef) {
        SyncBillRequest req = new SyncBillRequest();
        req.setClientOperationUuid(uuid);
        req.setLocalBillReference(localRef);
        req.setDeviceId("DEV-TEST-01");
        req.setOrderType(OrderType.DINE_IN);
        req.setCabinTableRef("Cabin 5");
        req.setPaymentMethod(PaymentMethod.CASH);
        req.setCashTendered(BigDecimal.valueOf(200.00));
        req.setChangeAmount(BigDecimal.ZERO);
        req.setOfflineCreatedAt(Instant.now());

        BillItemRequest item = new BillItemRequest(101L, 2, "Extra spicy", BigDecimal.valueOf(100.00));
        req.setItems(Collections.singletonList(item));
        return req;
    }

    @Test
    @DisplayName("syncSingleBill: successfully syncs new offline bill and returns server bill ID")
    void testSyncNewOfflineBill() {
        String uuid = "OFF-UUID-001";
        String localRef = "OFF-DEV1-20261113-0001";
        SyncBillRequest req = buildSyncRequest(uuid, localRef);

        when(billRepository.findByIdempotencyKey(uuid)).thenReturn(Optional.empty());

        BillResponse billResp = new BillResponse();
        billResp.setId(200L);
        billResp.setBillNumber("TSS-20261113-0200");
        billResp.setGrandTotal(BigDecimal.valueOf(200.00));

        when(billService.createBill(any(CreateBillRequest.class), eq(cashier), eq(uuid))).thenReturn(billResp);

        SyncBillResponse syncRes = posSyncService.syncSingleBill(req, cashier);

        assertThat(syncRes.getStatus()).isEqualTo("SYNCED");
        assertThat(syncRes.getServerBillNumber()).isEqualTo("TSS-20261113-0200");
        assertThat(syncRes.getServerBillId()).isEqualTo(200L);
        assertThat(syncRes.getClientOperationUuid()).isEqualTo(uuid);
        assertThat(syncRes.getLocalBillReference()).isEqualTo(localRef);
    }

    @Test
    @DisplayName("syncSingleBill: duplicate sync request returns ALREADY_SYNCED without creating bill")
    void testDuplicateSyncRequest() {
        String uuid = "OFF-UUID-002";
        String localRef = "OFF-DEV1-20261113-0002";
        SyncBillRequest req = buildSyncRequest(uuid, localRef);

        Bill existing = new Bill();
        existing.setId(300L);
        existing.setBillNumber("TSS-20261113-0300");
        existing.setIdempotencyKey(uuid);
        existing.setLocalBillReference(localRef);
        existing.setCreatedAt(Instant.now());

        when(billRepository.findByIdempotencyKey(uuid)).thenReturn(Optional.of(existing));

        BillResponse existingResp = new BillResponse();
        existingResp.setId(300L);
        existingResp.setBillNumber("TSS-20261113-0300");
        when(billService.mapToResponse(eq(existing), any())).thenReturn(existingResp);

        SyncBillResponse syncRes = posSyncService.syncSingleBill(req, cashier);

        assertThat(syncRes.getStatus()).isEqualTo("ALREADY_SYNCED");
        assertThat(syncRes.getServerBillNumber()).isEqualTo("TSS-20261113-0300");
        verify(billService, never()).createBill(any(), any(), any());
    }

    @Test
    @DisplayName("syncSingleBill: revoked device returns NEEDS_REVIEW")
    void testSyncRevokedDeviceReturnsNeedsReview() {
        String uuid = "OFF-UUID-REVOKED";
        String localRef = "OFF-DEV1-20261113-0003";
        SyncBillRequest req = buildSyncRequest(uuid, localRef);

        when(posDeviceService.isDeviceActive("DEV-TEST-01")).thenReturn(false);

        SyncBillResponse syncRes = posSyncService.syncSingleBill(req, cashier);

        assertThat(syncRes.getStatus()).isEqualTo("NEEDS_REVIEW");
        assertThat(syncRes.getMessage()).contains("revoked");
        verify(billService, never()).createBill(any(), any(), any());
    }
}
