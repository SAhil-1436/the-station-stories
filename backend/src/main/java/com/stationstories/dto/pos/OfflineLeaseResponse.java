package com.stationstories.dto.pos;

import java.time.Instant;

public class OfflineLeaseResponse {

    private String leaseToken;
    private String deviceId;
    private Long cashierId;
    private String cashierUsername;
    private String cashierFullName;
    private Instant issuedAt;
    private Instant expiresAt;
    private String publicKeySpkiBase64;

    public OfflineLeaseResponse() {}

    public OfflineLeaseResponse(String leaseToken, String deviceId, Long cashierId, String cashierUsername,
                                String cashierFullName, Instant issuedAt, Instant expiresAt, String publicKeySpkiBase64) {
        this.leaseToken = leaseToken;
        this.deviceId = deviceId;
        this.cashierId = cashierId;
        this.cashierUsername = cashierUsername;
        this.cashierFullName = cashierFullName;
        this.issuedAt = issuedAt;
        this.expiresAt = expiresAt;
        this.publicKeySpkiBase64 = publicKeySpkiBase64;
    }

    public String getLeaseToken() {
        return leaseToken;
    }

    public void setLeaseToken(String leaseToken) {
        this.leaseToken = leaseToken;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public Long getCashierId() {
        return cashierId;
    }

    public void setCashierId(Long cashierId) {
        this.cashierId = cashierId;
    }

    public String getCashierUsername() {
        return cashierUsername;
    }

    public void setCashierUsername(String cashierUsername) {
        this.cashierUsername = cashierUsername;
    }

    public String getCashierFullName() {
        return cashierFullName;
    }

    public void setCashierFullName(String cashierFullName) {
        this.cashierFullName = cashierFullName;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(Instant issuedAt) {
        this.issuedAt = issuedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getPublicKeySpkiBase64() {
        return publicKeySpkiBase64;
    }

    public void setPublicKeySpkiBase64(String publicKeySpkiBase64) {
        this.publicKeySpkiBase64 = publicKeySpkiBase64;
    }
}
