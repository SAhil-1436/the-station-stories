package com.stationstories.dto.pos;

import java.time.Instant;

public class DeviceRegistrationResponse {

    private String deviceId;
    private String deviceName;
    private String registeredByUsername;
    private Boolean isRevoked;
    private Instant createdAt;

    public DeviceRegistrationResponse() {}

    public DeviceRegistrationResponse(String deviceId, String deviceName, String registeredByUsername, Boolean isRevoked, Instant createdAt) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.registeredByUsername = registeredByUsername;
        this.isRevoked = isRevoked;
        this.createdAt = createdAt;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getRegisteredByUsername() {
        return registeredByUsername;
    }

    public void setRegisteredByUsername(String registeredByUsername) {
        this.registeredByUsername = registeredByUsername;
    }

    public Boolean getIsRevoked() {
        return isRevoked;
    }

    public void setIsRevoked(Boolean isRevoked) {
        this.isRevoked = isRevoked;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
