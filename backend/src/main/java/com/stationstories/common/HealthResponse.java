package com.stationstories.common;

import java.time.Instant;
import java.util.Map;

public class HealthResponse {
    private String status;
    private String appName;
    private String version;
    private String phase;
    private String databaseStatus;
    private String databaseName;
    private Instant timestamp;
    private Map<String, Object> details;

    public HealthResponse() {
        this.timestamp = Instant.now();
    }

    public HealthResponse(String status, String appName, String version, String phase,
                          String databaseStatus, String databaseName, Instant timestamp,
                          Map<String, Object> details) {
        this.status = status;
        this.appName = appName;
        this.version = version;
        this.phase = phase;
        this.databaseStatus = databaseStatus;
        this.databaseName = databaseName;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
        this.details = details;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getDatabaseStatus() {
        return databaseStatus;
    }

    public void setDatabaseStatus(String databaseStatus) {
        this.databaseStatus = databaseStatus;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}
