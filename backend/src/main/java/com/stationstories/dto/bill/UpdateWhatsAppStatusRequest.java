package com.stationstories.dto.bill;

import com.stationstories.entity.enums.WhatsAppDeliveryStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateWhatsAppStatusRequest {

    @NotNull(message = "WhatsApp delivery status is required")
    private WhatsAppDeliveryStatus status;

    public UpdateWhatsAppStatusRequest() {}

    public UpdateWhatsAppStatusRequest(WhatsAppDeliveryStatus status) {
        this.status = status;
    }

    public WhatsAppDeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(WhatsAppDeliveryStatus status) {
        this.status = status;
    }
}
