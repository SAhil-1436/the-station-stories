package com.stationstories.service;

import com.stationstories.entity.Bill;
import com.stationstories.entity.BillOperation;
import com.stationstories.entity.User;
import com.stationstories.exception.BusinessException;
import com.stationstories.repository.BillOperationRepository;
import com.stationstories.repository.BillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class BillOperationRegistrationService {

    private static final Logger log = LoggerFactory.getLogger(BillOperationRegistrationService.class);

    private final BillOperationRepository billOperationRepository;
    private final BillRepository billRepository;

    public BillOperationRegistrationService(BillOperationRepository billOperationRepository,
                                            BillRepository billRepository) {
        this.billOperationRepository = billOperationRepository;
        this.billRepository = billRepository;
    }

    /**
     * Claims an operation key in an isolated, independently committed transaction (REQUIRES_NEW).
     * If this is a new operation, registers it in PROCESSING state.
     * If the operation already exists, returns its current state.
     * Guaranteed to survive any subsequent rollback of the bill processing transaction.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public BillOperation claimOperation(String operationKey, User cashier, String deviceId) {
        if (operationKey == null || operationKey.trim().isEmpty()) {
            throw new IllegalArgumentException("Operation key cannot be blank.");
        }
        String key = operationKey.trim();

        // 1. Check if bill already committed with this idempotency key
        Optional<Bill> existingBill = billRepository.findByIdempotencyKey(key);
        if (existingBill.isPresent()) {
            Bill bill = existingBill.get();
            // Ensure operation record exists and reflects SUCCEEDED
            Optional<BillOperation> opOpt = billOperationRepository.findByOperationKey(key);
            BillOperation op;
            if (opOpt.isPresent()) {
                op = opOpt.get();
                if (!BillOperation.STATUS_SUCCEEDED.equals(op.getStatus())) {
                    op.setStatus(BillOperation.STATUS_SUCCEEDED);
                    op.setBill(bill);
                    op = billOperationRepository.saveAndFlush(op);
                }
            } else {
                op = new BillOperation(key, cashier != null ? cashier : bill.getCashier(), BillOperation.STATUS_SUCCEEDED);
                op.setBill(bill);
                op.setDeviceId(deviceId != null ? deviceId : bill.getDeviceId());
                op = billOperationRepository.saveAndFlush(op);
            }
            return op;
        }

        // 2. Check if an operation record already exists in bill_operations
        Optional<BillOperation> existingOp = billOperationRepository.findByOperationKey(key);
        if (existingOp.isPresent()) {
            BillOperation op = existingOp.get();
            log.info("Existing bill operation found for key {}: status={}", key, op.getStatus());
            return op;
        }

        // 3. Register a new operation in PROCESSING status
        BillOperation newOp = new BillOperation(key, cashier, BillOperation.STATUS_PROCESSING);
        newOp.setDeviceId(deviceId);
        try {
            return billOperationRepository.saveAndFlush(newOp);
        } catch (DataIntegrityViolationException ex) {
            // Concurrent race condition: another thread/request claimed the same operation key
            log.warn("Concurrent duplicate operation claim detected for key {}. Loading claimed record.", key);
            return billOperationRepository.findByOperationKey(key)
                    .orElseThrow(() -> new BusinessException("Concurrent operation registration conflict on key: " + key));
        }
    }

    /**
     * Marks an operation as SUCCEEDED with its generated bill in an isolated transaction.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public BillOperation markSucceeded(String operationKey, Bill bill) {
        String key = operationKey.trim();
        BillOperation op = billOperationRepository.findByOperationKey(key)
                .orElseGet(() -> new BillOperation(key, bill.getCashier(), BillOperation.STATUS_SUCCEEDED));

        op.setStatus(BillOperation.STATUS_SUCCEEDED);
        op.setBill(bill);
        op.setErrorMessage(null);
        return billOperationRepository.saveAndFlush(op);
    }

    /**
     * Marks an operation as DEFINITIVELY_FAILED in an isolated transaction.
     * Survives the bill transaction's rollback.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public BillOperation markFailed(String operationKey, String errorMessage) {
        String key = operationKey.trim();
        Optional<BillOperation> opOpt = billOperationRepository.findByOperationKey(key);
        if (opOpt.isPresent()) {
            BillOperation op = opOpt.get();
            // Never overwrite an already succeeded operation
            if (BillOperation.STATUS_SUCCEEDED.equals(op.getStatus())) {
                log.warn("Attempted to mark succeeded operation {} as failed. Preserving SUCCEEDED status.", key);
                return op;
            }
            op.setStatus(BillOperation.STATUS_DEFINITIVELY_FAILED);
            op.setErrorMessage(errorMessage != null && errorMessage.length() > 500
                    ? errorMessage.substring(0, 500)
                    : errorMessage);
            return billOperationRepository.saveAndFlush(op);
        }
        return null;
    }

    /**
     * Marks an operation as NEEDS_REVIEW in an isolated transaction.
     * Used when an unexpected exception or uncertain database condition occurs.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public BillOperation markNeedsReview(String operationKey, String reason) {
        String key = operationKey.trim();
        Optional<BillOperation> opOpt = billOperationRepository.findByOperationKey(key);
        if (opOpt.isPresent()) {
            BillOperation op = opOpt.get();
            if (BillOperation.STATUS_SUCCEEDED.equals(op.getStatus())) {
                return op;
            }
            op.setStatus(BillOperation.STATUS_NEEDS_REVIEW);
            op.setErrorMessage(reason != null && reason.length() > 500
                    ? reason.substring(0, 500)
                    : reason);
            return billOperationRepository.saveAndFlush(op);
        }
        return null;
    }
}
