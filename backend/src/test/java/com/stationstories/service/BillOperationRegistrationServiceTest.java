package com.stationstories.service;

import com.stationstories.entity.Bill;
import com.stationstories.entity.BillOperation;
import com.stationstories.entity.User;
import com.stationstories.repository.BillOperationRepository;
import com.stationstories.repository.BillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillOperationRegistrationServiceTest {

    @Mock
    private BillOperationRepository billOperationRepository;

    @Mock
    private BillRepository billRepository;

    @InjectMocks
    private BillOperationRegistrationService registrationService;

    private User testCashier;

    @BeforeEach
    void setUp() {
        testCashier = new User("cashier", "pass", "Cashier", "9876543210", null);
        testCashier.setId(10L);
    }

    @Test
    @DisplayName("claimOperation: successfully claims new operation in PROCESSING state")
    void testClaimNewOperation() {
        String key = "OP-NEW-001";
        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.empty());

        BillOperation savedOp = new BillOperation(key, testCashier, BillOperation.STATUS_PROCESSING);
        when(billOperationRepository.saveAndFlush(any(BillOperation.class))).thenReturn(savedOp);

        BillOperation result = registrationService.claimOperation(key, testCashier, "DEV-01");

        assertThat(result).isNotNull();
        assertThat(result.getOperationKey()).isEqualTo(key);
        assertThat(result.getStatus()).isEqualTo(BillOperation.STATUS_PROCESSING);
        verify(billOperationRepository).saveAndFlush(argThat(op ->
                key.equals(op.getOperationKey()) &&
                BillOperation.STATUS_PROCESSING.equals(op.getStatus()) &&
                "DEV-01".equals(op.getDeviceId())
        ));
    }

    @Test
    @DisplayName("claimOperation: returns existing operation when already registered")
    void testClaimExistingOperation() {
        String key = "OP-EXIST-001";
        BillOperation existing = new BillOperation(key, testCashier, BillOperation.STATUS_PROCESSING);

        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(existing));

        BillOperation result = registrationService.claimOperation(key, testCashier, "DEV-01");

        assertThat(result).isSameAs(existing);
        verify(billOperationRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("claimOperation: handles concurrent race condition via DataIntegrityViolationException")
    void testClaimConcurrentRaceCondition() {
        String key = "OP-RACE-001";
        when(billRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(billOperationRepository.findByOperationKey(key))
                .thenReturn(Optional.empty()) // first check returns empty
                .thenReturn(Optional.of(new BillOperation(key, testCashier, BillOperation.STATUS_PROCESSING))); // after catch

        when(billOperationRepository.saveAndFlush(any(BillOperation.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate key entry for operation_key"));

        BillOperation result = registrationService.claimOperation(key, testCashier, "DEV-01");

        assertThat(result).isNotNull();
        assertThat(result.getOperationKey()).isEqualTo(key);
    }

    @Test
    @DisplayName("claimOperation: blank key throws IllegalArgumentException")
    void testClaimBlankKeyThrows() {
        assertThatThrownBy(() -> registrationService.claimOperation("   ", testCashier, "DEV-01"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("markSucceeded: updates operation to SUCCEEDED and links bill")
    void testMarkSucceeded() {
        String key = "OP-SUCC-001";
        BillOperation op = new BillOperation(key, testCashier, BillOperation.STATUS_PROCESSING);
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));
        when(billOperationRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

        Bill bill = new Bill();
        bill.setId(100L);
        bill.setBillNumber("TSS-20261113-0100");

        BillOperation updated = registrationService.markSucceeded(key, bill);

        assertThat(updated.getStatus()).isEqualTo(BillOperation.STATUS_SUCCEEDED);
        assertThat(updated.getBill()).isEqualTo(bill);
    }

    @Test
    @DisplayName("markFailed: updates operation to DEFINITIVELY_FAILED with error message")
    void testMarkFailed() {
        String key = "OP-FAIL-001";
        BillOperation op = new BillOperation(key, testCashier, BillOperation.STATUS_PROCESSING);
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));
        when(billOperationRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

        BillOperation updated = registrationService.markFailed(key, "Insufficient stock");

        assertThat(updated.getStatus()).isEqualTo(BillOperation.STATUS_DEFINITIVELY_FAILED);
        assertThat(updated.getErrorMessage()).isEqualTo("Insufficient stock");
    }

    @Test
    @DisplayName("markFailed: cannot overwrite an already SUCCEEDED operation")
    void testMarkFailedCannotOverwriteSucceeded() {
        String key = "OP-SUCC-IMMUTABLE";
        BillOperation op = new BillOperation(key, testCashier, BillOperation.STATUS_SUCCEEDED);
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));

        BillOperation result = registrationService.markFailed(key, "Random late error");

        assertThat(result.getStatus()).isEqualTo(BillOperation.STATUS_SUCCEEDED);
        verify(billOperationRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("markNeedsReview: sets status to NEEDS_REVIEW")
    void testMarkNeedsReview() {
        String key = "OP-REVIEW-001";
        BillOperation op = new BillOperation(key, testCashier, BillOperation.STATUS_PROCESSING);
        when(billOperationRepository.findByOperationKey(key)).thenReturn(Optional.of(op));
        when(billOperationRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

        BillOperation updated = registrationService.markNeedsReview(key, "Price mismatch detected");

        assertThat(updated.getStatus()).isEqualTo(BillOperation.STATUS_NEEDS_REVIEW);
        assertThat(updated.getErrorMessage()).isEqualTo("Price mismatch detected");
    }
}
