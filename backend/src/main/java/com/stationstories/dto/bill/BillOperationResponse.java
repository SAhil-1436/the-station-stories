package com.stationstories.dto.bill;

import java.time.Instant;

public class BillOperationResponse {

    private String operationKey;
    private String status; // "PROCESSING", "SUCCEEDED", "DEFINITIVELY_FAILED", "NOT_FOUND"
    private String message;
    private BillResponse bill;
    private Instant createdAt;

    public BillOperationResponse() {}

    public BillOperationResponse(String operationKey, String status, String message, BillResponse bill, Instant createdAt) {
        this.operationKey = operationKey;
        this.status = status;
        this.message = message;
        this.bill = bill;
        this.createdAt = createdAt;
    }

    public static BillOperationResponse notFound(String operationKey) {
        return new BillOperationResponse(
                operationKey,
                "NOT_FOUND",
                "No bill creation operation found for this idempotency key",
                null,
                Instant.now()
        );
    }

    public static BillOperationResponse processing(String operationKey, Instant createdAt) {
        return new BillOperationResponse(
                operationKey,
                "PROCESSING",
                "Bill creation is currently processing",
                null,
                createdAt != null ? createdAt : Instant.now()
        );
    }

    public static BillOperationResponse succeeded(String operationKey, BillResponse bill, Instant createdAt) {
        return new BillOperationResponse(
                operationKey,
                "SUCCEEDED",
                "Bill operation succeeded",
                bill,
                createdAt != null ? createdAt : Instant.now()
        );
    }

    public static BillOperationResponse definitivelyFailed(String operationKey, String reason, Instant createdAt) {
        return new BillOperationResponse(
                operationKey,
                "DEFINITIVELY_FAILED",
                reason != null ? reason : "Bill operation failed definitively",
                null,
                createdAt != null ? createdAt : Instant.now()
        );
    }

    public String getOperationKey() {
        return operationKey;
    }

    public void setOperationKey(String operationKey) {
        this.operationKey = operationKey;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public BillResponse getBill() {
        return bill;
    }

    public void setBill(BillResponse bill) {
        this.bill = bill;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
