package com.stationstories.dto.pos;

import jakarta.validation.constraints.NotBlank;

public class OfflineLeaseRequest {

    @NotBlank(message = "Device ID is required to bind offline lease")
    private String deviceId;

    public OfflineLeaseRequest() {}

    public OfflineLeaseRequest(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
}
