package com.stationstories.service;

import com.stationstories.common.HealthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class HealthService {

    private static final Logger log = LoggerFactory.getLogger(HealthService.class);

    private final DataSource dataSource;

    @Value("${app.name:The Station Stories}")
    private String appName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    public HealthService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public HealthResponse checkHealth() {
        String dbStatus = "DISCONNECTED";
        String dbName = "UNKNOWN";
        Map<String, Object> details = new HashMap<>();

        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                dbStatus = "CONNECTED";
                DatabaseMetaData metaData = connection.getMetaData();
                dbName = connection.getCatalog();
                details.put("databaseProduct", metaData.getDatabaseProductName());
                details.put("databaseVersion", metaData.getDatabaseProductVersion());
                details.put("driverName", metaData.getDriverName());
            }
        } catch (Exception ex) {
            log.error("Database health check error: {}", ex.getMessage());
            details.put("error", ex.getMessage());
        }

        details.put("javaVersion", System.getProperty("java.version"));
        details.put("osName", System.getProperty("os.name"));

        return new HealthResponse(
                "UP",
                appName,
                appVersion,
                "Phase 1 - Project Foundation & Environment Setup",
                dbStatus,
                dbName,
                Instant.now(),
                details
        );
    }
}
