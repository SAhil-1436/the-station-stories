package com.stationstories.dto.bill;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class CancelBillRequest {

    @NotBlank(message = "Cancellation reason is mandatory")
    private String cancellationReason;

    @DecimalMin(value = "0.00", message = "Refund amount cannot be negative")
    private BigDecimal refundAmount = BigDecimal.ZERO;

    public CancelBillRequest() {}

    public CancelBillRequest(String cancellationReason, BigDecimal refundAmount) {
        this.cancellationReason = cancellationReason;
        this.refundAmount = refundAmount;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount != null ? refundAmount : BigDecimal.ZERO;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }
}
