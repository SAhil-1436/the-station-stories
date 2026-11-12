package com.stationstories.controller;

import com.stationstories.common.ApiResponse;
import com.stationstories.common.HealthResponse;
import com.stationstories.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "System liveness, readiness, and database connectivity diagnostic endpoints")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    @Operation(summary = "Check backend and database health", description = "Returns active platform status, environment, and MySQL database connection verification")
    public ResponseEntity<ApiResponse<HealthResponse>> getHealth() {
        HealthResponse health = healthService.checkHealth();
        return ResponseEntity.ok(ApiResponse.success("Backend system is operational", health));
    }
}
