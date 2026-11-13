package com.stationstories.service;

import com.stationstories.dto.bill.BillItemRequest;
import com.stationstories.dto.bill.BillOperationResponse;
import com.stationstories.dto.bill.BillResponse;
import com.stationstories.dto.bill.CreateBillRequest;
import com.stationstories.entity.*;
import com.stationstories.entity.enums.OrderType;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.exception.BusinessException;
import com.stationstories.repository.BillNumberSequenceRepository;
import com.stationstories.repository.BillOperationRepository;
import com.stationstories.repository.BillRepository;
import com.stationstories.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BillIdempotencyTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private BillNumberSequenceRepository sequenceRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private CustomerService customerService;

    @Mock
    private RestaurantSettingService settingService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private BillOperationRepository billOperationRepository;

    @Mock
    private BillOperationRegistrationService billOperationRegistrationService;

    @Mock
    private BillProcessingService billProcessingService;

    @InjectMocks
    private BillService billService;

    private User cashier1;
    private User cashier2;
    private User adminUser;
    private RestaurantSetting defaultSettings;

    @BeforeEach
    void setUp() {
        Role cashierRole = new Role("ROLE_CASHIER", "Cashier");
        Role adminRole = new Role("ROLE_ADMIN", "Administrator");

        cashier1 = new User("cashier1", "hash", "Cashier One", "9876543210", "CARD-1");
        cashier1.setId(10L);
        cashier1.setRoles(Set.of(cashierRole));

        cashier2 = new User("cashier2", "hash", "Cashier Two", "9876543211", "CARD-2");
        cashier2.setId(20L);
        cashier2.setRoles(Set.of(cashierRole));

        adminUser = new User("admin", "hash", "Owner Admin", "9876543212", "CARD-3");
        adminUser.setId(1L);
        adminUser.setRoles(Set.of(adminRole));

        defaultSettings = new RestaurantSetting();
        defaultSettings.setRestaurantName("THE STATION STORIES");
        defaultSettings.setGstEnabled(false);

        when(settingService.getOrCreateSettings()).thenReturn(defaultSettings);
    }

    private CreateBillRequest buildRequest(String idempotencyKey) {
        CreateBillRequest req = new CreateBillRequest();
        req.setOrderType(OrderType.DINE_IN);
        req.setCabinTableRef("Cabin 1");
        req.setPaymentMethod(PaymentMethod.CASH);
        req.setIdempotencyKey(idempotencyKey);

        BillItemRequest itemReq = new BillItemRequest();
        itemReq.setMenuItemId(101L);
        itemReq.setQuantity(2);
        req.setItems(Collections.singletonList(itemReq));
        return req;
    }

    @Test
    @DisplayName("First request claims operation in REQUIRES_NEW, creates bill, and marks operation SUCCEEDED")
    void testFirstRequestWithIdempotencyKey() {
        String key = "IDEMP-TEST-001";
        CreateBillRequest req = buildRequest(key);

        Bill bill = new Bill();
        bill.setId(123L);
        bill.setBillNumber("TSS-20261113-0001");
        bill.setIdempotencyKey(key);
        bill.setGrandTotal(BigDecimal.valueOf(200.00));
        bill.setSubtotal(BigDecimal.valueOf(200.00));
        bill.setTotalTax(BigDecimal.ZERO);
        bill.setCashier(cashier1);

        BillOperation opProcessing = new BillOperation(key, cashier1, BillOperation.STATUS_PROCESSING);
        when(billOperationRegistrationService.claimOperation(eq(key), eq(cashier1), any())).thenReturn(opProcessing);
        when(billProcessingService.executeBillCreation(any(), any(), eq(key), any(), any(), anyBoolean(), any())).thenReturn(bill);

        BillResponse response = billService.createBill(req, cashier1, key);

        assertThat(response).isNotNull();
        assertThat(response.getBillNumber()).isEqualTo("TSS-20261113-0001");
        verify(billOperationRegistrationService).claimOperation(eq(key), eq(cashier1), any());
        verify(billProcessingService).executeBillCreation(any(), any(), eq(key), any(), any(), anyBoolean(), any());
        verify(billOperationRegistrationService).markSucceeded(key, bill);
    }

    @Test
    @DisplayName("Duplicate request with same idempotency key returns existing bill without creating new one")
    void testDuplicateRequestReturnsExistingBill() {
        String key = "IDEMP-TEST-002";
        CreateBillRequest req = buildRequest(key);

        Bill existingBill = new Bill();
        existingBill.setId(555L);
        existingBill.setBillNumber("TSS-20261113-0005");
        existingBill.setIdempotencyKey(key);
        existingBill.setGrandTotal(BigDecimal.valueOf(200.00));
        existingBill.setSubtotal(BigDecimal.valueOf(200.00));
        existingBill.setTotalTax(BigDecimal.ZERO);
        existingBill.setCashier(cashier1);

        BillOperation opSucceeded = new BillOperation(key, cashier1, BillOperation.STATUS_SUCCEEDED);
        opSucceeded.setBill(existingBill);
        when(billOperationRegistrationService.claimOperation(eq(key), eq(cashier1), any())).thenReturn(opSucceeded);

        BillResponse response = billService.createBill(req, cashier1, key);

        assertThat(response).isNotNull();
        assertThat(response.getBillNumber()).isEqualTo("TSS-20261113-0005");
        verify(billProcessingService, never()).executeBillCreation(any(), any(), any(), any(), any(), anyBoolean(), any());
    }

    @Test
    @DisplayName("Bill creation rollback leaves operation record marked as failed in isolated transaction")
    void testBillCreationFailureLeavesOperationRecordIntact() {
        String key = "IDEMP-TEST-FAIL-01";
        CreateBillRequest req = buildRequest(key);

        BillOperation opProcessing = new BillOperation(key, cashier1, BillOperation.STATUS_PROCESSING);
        when(billOperationRegistrationService.claimOperation(eq(key), eq(cashier1), any())).thenReturn(opProcessing);
        when(billProcessingService.executeBillCreation(any(), any(), eq(key), any(), any(), anyBoolean(), any()))
                .thenThrow(new BusinessException("Dish is out of stock"));

        assertThatThrownBy(() -> billService.createBill(req, cashier1, key))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Dish is out of stock");

        // Verify failure was recorded in isolated transaction
        verify(billOperationRegistrationService).markFailed(key, "Dish is out of stock");
    }

    @Test
    @DisplayName("Reconcile operation returns SUCCEEDED and authoritative bill when operation succeeded")
    void testReconcileSucceededOperation() {
        String key = "IDEMP-TEST-003";

        Bill bill = new Bill();
        bill.setId(777L);
        bill.setBillNumber("TSS-20261113-0007");
        bill.setIdempotencyKey(key);
        bill.setGrandTotal(BigDecimal.valueOf(350.00));
        bill.setSubtotal(BigDecimal.valueOf(350.00));
        bill.setTotalTax(BigDecimal.ZERO);
        bill.setCashier(cashier1);

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(bill));

        BillOperationResponse res = billService.reconcileOperation(key, cashier1);

        assertThat(res.getStatus()).isEqualTo("SUCCEEDED");
        assertThat(res.getBill()).isNotNull();
        assertThat(res.getBill().getBillNumber()).isEqualTo("TSS-20261113-0007");
    }

    @Test
    @DisplayName("Reconcile operation returns PROCESSING when still in flight and does NOT fail after 60 seconds")
    void testReconcileProcessingOperationNotTimedOutAfter60Seconds() {
        String key = "IDEMP-TEST-004";

        BillOperation op = new BillOperation(key, cashier1, BillOperation.STATUS_PROCESSING);
        // Stale timestamp (120 seconds old)
        op.setCreatedAt(Instant.now().minusSeconds(120));

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));

        BillOperationResponse res = billService.reconcileOperation(key, cashier1);

        // Must NOT be marked failed merely because 60 seconds passed!
        assertThat(res.getStatus()).isEqualTo("PROCESSING");
    }

    @Test
    @DisplayName("Reconcile operation returns NEEDS_REVIEW when flagged for manual inspection")
    void testReconcileNeedsReviewOperation() {
        String key = "IDEMP-TEST-REVIEW";

        BillOperation op = new BillOperation(key, cashier1, BillOperation.STATUS_NEEDS_REVIEW);
        op.setErrorMessage("Price snapshot discrepancy requires manager review");

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));

        BillOperationResponse res = billService.reconcileOperation(key, cashier1);

        assertThat(res.getStatus()).isEqualTo("NEEDS_REVIEW");
        assertThat(res.getMessage()).contains("Price snapshot discrepancy");
    }

    @Test
    @DisplayName("Reconcile operation returns DEFINITIVELY_FAILED when operation definitively failed")
    void testReconcileFailedOperation() {
        String key = "IDEMP-TEST-005";

        BillOperation op = new BillOperation(key, cashier1, BillOperation.STATUS_DEFINITIVELY_FAILED);
        op.setErrorMessage("Stock depleted for item 101");

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));

        BillOperationResponse res = billService.reconcileOperation(key, cashier1);

        assertThat(res.getStatus()).isEqualTo("DEFINITIVELY_FAILED");
        assertThat(res.getMessage()).contains("Stock depleted");
    }

    @Test
    @DisplayName("Reconcile operation returns NOT_FOUND when neither bill nor operation exists")
    void testReconcileNotFoundOperation() {
        String key = "IDEMP-NON-EXISTENT";

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.empty());

        BillOperationResponse res = billService.reconcileOperation(key, cashier1);

        assertThat(res.getStatus()).isEqualTo("NOT_FOUND");
    }

    @Test
    @DisplayName("Reconcile operation: Admin can reconcile any cashier's operation")
    void testReconcileAdminCanAccessAnyCashierOperation() {
        String key = "IDEMP-TEST-006";

        Bill bill = new Bill();
        bill.setId(888L);
        bill.setBillNumber("TSS-20261113-0008");
        bill.setIdempotencyKey(key);
        bill.setGrandTotal(BigDecimal.valueOf(150.00));
        bill.setSubtotal(BigDecimal.valueOf(150.00));
        bill.setTotalTax(BigDecimal.ZERO);
        bill.setCashier(cashier1); // Belongs to cashier 1

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(bill));

        // Reconciled by adminUser
        BillOperationResponse res = billService.reconcileOperation(key, adminUser);

        assertThat(res.getStatus()).isEqualTo("SUCCEEDED");
        assertThat(res.getBill().getBillNumber()).isEqualTo("TSS-20261113-0008");
    }

    @Test
    @DisplayName("Reconcile operation: Cashier cannot access another cashier's operation (403 Forbidden)")
    void testReconcileOtherCashierAccessDenied() {
        String key = "IDEMP-TEST-007";

        Bill bill = new Bill();
        bill.setId(999L);
        bill.setBillNumber("TSS-20261113-0009");
        bill.setIdempotencyKey(key);
        bill.setCashier(cashier1); // Belongs to cashier 1

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(bill));

        // Cashier 2 tries to reconcile cashier 1's operation
        assertThatThrownBy(() -> billService.reconcileOperation(key, cashier2))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Unauthorized to access operation record belonging to another cashier");
    }
}
