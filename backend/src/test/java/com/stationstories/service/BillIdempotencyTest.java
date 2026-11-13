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
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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

    @InjectMocks
    private BillService billService;

    private User cashier1;
    private User cashier2;
    private User adminUser;
    private RestaurantSetting defaultSettings;
    private MenuItem item;

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

        Category cat = new Category("Fast Food", null, 1, true, null);
        item = new MenuItem(cat, "Burger", null, "Desc", BigDecimal.valueOf(100.00), true, true, null, false, 0, 1);
        item.setId(101L);

        when(settingService.getOrCreateSettings()).thenReturn(defaultSettings);
        when(sequenceRepository.findBySequenceDateForUpdate(any(LocalDate.class)))
                .thenReturn(Optional.of(new BillNumberSequence(LocalDate.now(), 1)));
        when(menuItemRepository.findById(101L)).thenReturn(Optional.of(item));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> {
            Bill b = invocation.getArgument(0);
            b.setId(999L);
            return b;
        });
        when(billOperationRepository.saveAndFlush(any(BillOperation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(billOperationRepository.save(any(BillOperation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private CreateBillRequest buildRequest(String idempotencyKey) {
        CreateBillRequest req = new CreateBillRequest();
        req.setOrderType(OrderType.DINE_IN);
        req.setCabinTableRef("T1");
        req.setPaymentMethod(PaymentMethod.CASH);
        req.setIdempotencyKey(idempotencyKey);

        BillItemRequest itemReq = new BillItemRequest();
        itemReq.setMenuItemId(101L);
        itemReq.setQuantity(2);
        req.setItems(Collections.singletonList(itemReq));
        return req;
    }

    @Test
    @DisplayName("First request with new idempotency key creates bill and marks operation SUCCEEDED")
    void testFirstRequestWithIdempotencyKey() {
        String key = "IDEMP-TEST-001";
        CreateBillRequest req = buildRequest(key);

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.empty());

        BillResponse response = billService.createBill(req, cashier1, key);

        assertThat(response).isNotNull();
        assertThat(response.getBillNumber()).contains("TSS-");
        assertThat(response.getGrandTotal()).isEqualByComparingTo("200.00");

        // Verify Bill was saved with the idempotency key
        verify(billRepository).save(argThat(bill -> key.equals(bill.getIdempotencyKey())));
        // Verify BillOperation was created and updated
        verify(billOperationRepository).save(argThat(op -> 
            key.equals(op.getOperationKey()) && BillOperation.STATUS_SUCCEEDED.equals(op.getStatus())
        ));
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

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(existingBill));

        BillResponse response = billService.createBill(req, cashier1, key);

        assertThat(response).isNotNull();
        assertThat(response.getBillNumber()).isEqualTo("TSS-20261113-0005");
        // billRepository.save must NOT be called for a duplicate!
        verify(billRepository, never()).save(any(Bill.class));
    }

    @Test
    @DisplayName("Reconcile operation returns SUCCEEDED and authoritative bill when operation succeeded")
    void testReconcileSucceededOperation() {
        String key = "IDEMP-TEST-003";

        Bill bill = new Bill();
        bill.setId(777L);
        bill.setBillNumber("TSS-20261113-0007");
        bill.setIdempotencyKey(key);
        bill.setGrandTotal(BigDecimal.valueOf(200.00));
        bill.setSubtotal(BigDecimal.valueOf(200.00));
        bill.setTotalTax(BigDecimal.ZERO);
        bill.setCashier(cashier1);

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(bill));

        BillOperationResponse opResp = billService.reconcileOperation(key, cashier1);

        assertThat(opResp.getStatus()).isEqualTo("SUCCEEDED");
        assertThat(opResp.getBill()).isNotNull();
        assertThat(opResp.getBill().getBillNumber()).isEqualTo("TSS-20261113-0007");
    }

    @Test
    @DisplayName("Reconcile operation returns PROCESSING when in-flight")
    void testReconcileProcessingOperation() {
        String key = "IDEMP-TEST-004";

        BillOperation op = new BillOperation(key, cashier1, BillOperation.STATUS_PROCESSING);
        op.setCreatedAt(Instant.now());

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));

        BillOperationResponse opResp = billService.reconcileOperation(key, cashier1);

        assertThat(opResp.getStatus()).isEqualTo("PROCESSING");
        assertThat(opResp.getBill()).isNull();
    }

    @Test
    @DisplayName("Reconcile operation returns DEFINITIVELY_FAILED when operation failed")
    void testReconcileDefinitivelyFailedOperation() {
        String key = "IDEMP-TEST-005";

        BillOperation op = new BillOperation(key, cashier1, BillOperation.STATUS_DEFINITIVELY_FAILED);
        op.setErrorMessage("Dish 'Burger' is currently out of stock");
        op.setCreatedAt(Instant.now());

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));

        BillOperationResponse opResp = billService.reconcileOperation(key, cashier1);

        assertThat(opResp.getStatus()).isEqualTo("DEFINITIVELY_FAILED");
        assertThat(opResp.getMessage()).contains("out of stock");
        assertThat(opResp.getBill()).isNull();
    }

    @Test
    @DisplayName("Reconcile operation returns NOT_FOUND when key does not exist")
    void testReconcileNotFoundOperation() {
        String key = "IDEMP-UNKNOWN-KEY";

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.empty());

        BillOperationResponse opResp = billService.reconcileOperation(key, cashier1);

        assertThat(opResp.getStatus()).isEqualTo("NOT_FOUND");
        assertThat(opResp.getBill()).isNull();
    }

    @Test
    @DisplayName("Reconcile operation blocks unauthorized cashier from viewing another cashier's record")
    void testReconcileUnauthorizedAccessBlocked() {
        String key = "IDEMP-TEST-006";

        Bill bill = new Bill();
        bill.setId(888L);
        bill.setBillNumber("TSS-20261113-0008");
        bill.setIdempotencyKey(key);
        bill.setCashier(cashier1); // Belongs to cashier1

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(bill));

        // Cashier 2 tries to access Cashier 1's operation
        assertThatThrownBy(() -> billService.reconcileOperation(key, cashier2))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Unauthorized to access operation record");

        // Admin is authorized to access any cashier's operation
        BillOperationResponse adminResp = billService.reconcileOperation(key, adminUser);
        assertThat(adminResp.getStatus()).isEqualTo("SUCCEEDED");
    }
}
