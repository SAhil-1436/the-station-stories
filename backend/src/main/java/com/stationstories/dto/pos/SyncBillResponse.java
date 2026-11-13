package com.stationstories.dto.pos;

import com.stationstories.dto.bill.BillResponse;

import java.time.Instant;

public class SyncBillResponse {

    private String clientOperationUuid;
    private String localBillReference;
    private Long serverBillId;
    private String serverBillNumber;
    private Instant syncedAt;
    private String status; // "SYNCED", "ALREADY_SYNCED", "NEEDS_REVIEW", "FAILED"
    private String message;
    private BillResponse bill;

    public SyncBillResponse() {}

    public SyncBillResponse(String clientOperationUuid, String localBillReference, Long serverBillId,
                            String serverBillNumber, Instant syncedAt, String status, String message, BillResponse bill) {
        this.clientOperationUuid = clientOperationUuid;
        this.localBillReference = localBillReference;
        this.serverBillId = serverBillId;
        this.serverBillNumber = serverBillNumber;
        this.syncedAt = syncedAt;
        this.status = status;
        this.message = message;
        this.bill = bill;
    }

    public static SyncBillResponse synced(String clientOperationUuid, String localBillReference, BillResponse bill) {
        return new SyncBillResponse(
                clientOperationUuid,
                localBillReference,
                bill.getId(),
                bill.getBillNumber(),
                Instant.now(),
                "SYNCED",
                "Successfully synchronized offline bill",
                bill
        );
    }

    public static SyncBillResponse alreadySynced(String clientOperationUuid, String localBillReference, BillResponse bill) {
        return new SyncBillResponse(
                clientOperationUuid,
                localBillReference,
                bill.getId(),
                bill.getBillNumber(),
                bill.getCreatedAt(),
                "ALREADY_SYNCED",
                "Bill was previously synchronized and committed",
                bill
        );
    }

    public static SyncBillResponse needsReview(String clientOperationUuid, String localBillReference, String reason) {
        return new SyncBillResponse(
                clientOperationUuid,
                localBillReference,
                null,
                null,
                Instant.now(),
                "NEEDS_REVIEW",
                reason,
                null
        );
    }

    public static SyncBillResponse failed(String clientOperationUuid, String localBillReference, String errorMessage) {
        return new SyncBillResponse(
                clientOperationUuid,
                localBillReference,
                null,
                null,
                Instant.now(),
                "FAILED",
                errorMessage,
                null
        );
    }

    public String getClientOperationUuid() {
        return clientOperationUuid;
    }

    public void setClientOperationUuid(String clientOperationUuid) {
        this.clientOperationUuid = clientOperationUuid;
    }

    public String getLocalBillReference() {
        return localBillReference;
    }

    public void setLocalBillReference(String localBillReference) {
        this.localBillReference = localBillReference;
    }

    public Long getServerBillId() {
        return serverBillId;
    }

    public void setServerBillId(Long serverBillId) {
        this.serverBillId = serverBillId;
    }

    public String getServerBillNumber() {
        return serverBillNumber;
    }

    public void setServerBillNumber(String serverBillNumber) {
        this.serverBillNumber = serverBillNumber;
    }

    public Instant getSyncedAt() {
        return syncedAt;
    }

    public void setSyncedAt(Instant syncedAt) {
        this.syncedAt = syncedAt;
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
}
