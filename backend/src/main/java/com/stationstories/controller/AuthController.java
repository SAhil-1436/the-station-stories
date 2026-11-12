package com.stationstories.controller;

import com.stationstories.common.ApiResponse;
import com.stationstories.dto.auth.LoginRequest;
import com.stationstories.dto.auth.LoginResponse;
import com.stationstories.dto.auth.SetupAdminRequest;
import com.stationstories.dto.auth.UserDto;
import com.stationstories.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Admin and Staff authentication, profile retrieval, and secure setup")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT token", description = "Verifies username and password with BCrypt. Subject to rate limiting (5 attempts/minute).")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = extractClientIp(servletRequest);
        LoginResponse response = authService.login(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves user identity and roles from current JWT session.")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        UserDto userDto = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userDto));
    }

    @PostMapping("/setup-admin")
    @Operation(summary = "Initial Administrator Setup", description = "One-time setup endpoint to create the initial admin account. Permanently disabled once an admin exists.")
    public ResponseEntity<ApiResponse<UserDto>> setupInitialAdmin(
            @Valid @RequestBody SetupAdminRequest request,
            @RequestHeader(value = "X-Setup-Token", required = false)
            @Parameter(description = "Optional setup token matching app.security.admin-setup-token environment variable")
            String setupToken) {
        UserDto adminDto = authService.setupInitialAdmin(request, setupToken);
        return ResponseEntity.ok(ApiResponse.success("Initial administrator account created successfully", adminDto));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout confirmation", description = "Acknowledges client logout.")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", "Token discarded"));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
