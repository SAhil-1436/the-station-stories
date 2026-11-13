package com.stationstories.dto.pos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DeviceRegistrationRequest {

    @NotBlank(message = "Device name is required")
    @Size(min = 2, max = 150, message = "Device name must be between 2 and 150 characters")
    private String deviceName;

    public DeviceRegistrationRequest() {}

    public DeviceRegistrationRequest(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }
}
