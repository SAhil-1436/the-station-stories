package com.stationstories.service;

import com.stationstories.dto.bill.BillResponse;
import com.stationstories.dto.bill.CancelBillRequest;
import com.stationstories.entity.Bill;
import com.stationstories.entity.Payment;
import com.stationstories.entity.RestaurantSetting;
import com.stationstories.entity.User;
import com.stationstories.entity.enums.OrderType;
import com.stationstories.entity.enums.PaymentMethod;
import com.stationstories.entity.enums.PaymentStatus;
import com.stationstories.exception.BusinessException;
import com.stationstories.repository.BillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FinalizedBillProtectionTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private RestaurantSettingService settingService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private BillService billService;

    private User testAdmin;
    private Bill finalizedBill;

    @BeforeEach
    void setUp() {
        testAdmin = new User("admin", "hash", "Admin Manager", "9876543210", "TSS-ADMIN-001");
        testAdmin.setId(1L);

        finalizedBill = new Bill();
        finalizedBill.setId(300L);
        finalizedBill.setBillNumber("TSS-20261112-0042");
        finalizedBill.setInvoiceUuid("test-uuid-12345");
        finalizedBill.setOrderType(OrderType.DINE_IN);
        finalizedBill.setGrandTotal(BigDecimal.valueOf(350.00));
        finalizedBill.setSubtotal(BigDecimal.valueOf(350.00));
        finalizedBill.setPaymentMethod(PaymentMethod.UPI);
        finalizedBill.setPaymentStatus(PaymentStatus.PAID);
        finalizedBill.setDeleted(false);

        Payment payment = new Payment(finalizedBill, PaymentMethod.UPI, BigDecimal.valueOf(350.00), PaymentStatus.PAID, null);
        finalizedBill.addPayment(payment);

        RestaurantSetting settings = new RestaurantSetting();
        settings.setRestaurantName("THE STATION STORIES");
        when(settingService.getOrCreateSettings()).thenReturn(settings);
    }

    @Test
    @DisplayName("Should cancel bill, record mandatory reason and refund amount, and update status without deleting record")
    void testAuthoritativeBillCancellation() {
        when(billRepository.findById(300L)).thenReturn(Optional.of(finalizedBill));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CancelBillRequest request = new CancelBillRequest("Customer cancelled order before kitchen prep", BigDecimal.valueOf(350.00));
        BillResponse cancelledResponse = billService.cancelBill(300L, request, testAdmin);

        assertThat(cancelledResponse.getPaymentStatus()).isEqualTo(PaymentStatus.CANCELLED);
        assertThat(cancelledResponse.getCancellationReason()).isEqualTo("Customer cancelled order before kitchen prep");
        assertThat(cancelledResponse.getRefundAmount()).isEqualByComparingTo("350.00");
        assertThat(finalizedBill.isDeleted()).isFalse(); // Finalized bill permanently preserved in database!

        verify(auditLogService, times(1)).recordEvent(
                eq("BILL"), eq(300L), eq("BILL_CANCELLED"), eq(testAdmin), any(), any(), any());
    }

    @Test
    @DisplayName("Should prevent double cancellation of an already cancelled bill")
    void testPreventDoubleCancellation() {
        finalizedBill.setPaymentStatus(PaymentStatus.CANCELLED);
        when(billRepository.findById(300L)).thenReturn(Optional.of(finalizedBill));

        CancelBillRequest request = new CancelBillRequest("Cancel again", BigDecimal.ZERO);

        assertThatThrownBy(() -> billService.cancelBill(300L, request, testAdmin))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already cancelled");

        verify(billRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject refund amount exceeding original bill grand total")
    void testRejectRefundExceedingTotal() {
        when(billRepository.findById(300L)).thenReturn(Optional.of(finalizedBill));

        CancelBillRequest request = new CancelBillRequest("Excess refund attempt", BigDecimal.valueOf(500.00)); // Total was 350

        assertThatThrownBy(() -> billService.cancelBill(300L, request, testAdmin))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cannot exceed original grand total");

        verify(billRepository, never()).save(any());
    }
}
