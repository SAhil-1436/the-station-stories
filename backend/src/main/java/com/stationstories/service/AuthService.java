package com.stationstories.service;

import com.stationstories.dto.auth.CreateStaffRequest;
import com.stationstories.dto.auth.LoginRequest;
import com.stationstories.dto.auth.LoginResponse;
import com.stationstories.dto.auth.SetupAdminRequest;
import com.stationstories.dto.auth.UserDto;
import com.stationstories.entity.Role;
import com.stationstories.entity.User;
import com.stationstories.exception.BusinessException;
import com.stationstories.exception.ResourceNotFoundException;
import com.stationstories.repository.RoleRepository;
import com.stationstories.repository.UserRepository;
import com.stationstories.security.JwtTokenProvider;
import com.stationstories.security.LoginRateLimiter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final LoginRateLimiter loginRateLimiter;
    private final AuditLogService auditLogService;

    @Value("${app.security.admin-setup-token:}")
    private String adminSetupToken;

    @Value("${app.security.jwt.expiration-ms:28800000}")
    private long jwtExpirationMs;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       LoginRateLimiter loginRateLimiter,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.loginRateLimiter = loginRateLimiter;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request, String clientIp) {
        String rateLimitKey = clientIp != null ? clientIp : request.getUsername();

        if (loginRateLimiter.isBlocked(rateLimitKey)) {
            throw new BusinessException("Too many failed login attempts. Please wait 1 minute before trying again.", HttpStatus.TOO_MANY_REQUESTS);
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            loginRateLimiter.recordFailedAttempt(rateLimitKey);
            int remaining = loginRateLimiter.getRemainingAttempts(rateLimitKey);
            log.warn("Failed login attempt for user '{}' from IP {}. Remaining attempts: {}", request.getUsername(), clientIp, remaining);
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!user.isActive()) {
            throw new BusinessException("Account is disabled. Please contact the administrator.", HttpStatus.FORBIDDEN);
        }

        loginRateLimiter.resetAttempts(rateLimitKey);

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String token = jwtTokenProvider.generateToken(user.getUsername(), roleNames);
        auditLogService.recordEvent("USER", user.getId(), "LOGIN_SUCCESS", user, null, "Successful login", clientIp);

        return new LoginResponse(token, jwtExpirationMs / 1000, mapToUserDto(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return mapToUserDto(user);
    }

    @Transactional(readOnly = true)
    public User getUserEntity(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    @Transactional
    public UserDto createStaff(CreateStaffRequest request, User adminUser) {
        if (request.getCompanyCardNumber() == null || request.getCompanyCardNumber().trim().isEmpty()) {
            throw new BusinessException("Company card verification number is mandatory for staff accounts");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username '" + request.getUsername() + "' is already taken");
        }

        String targetRoleName = request.getRole() != null ? request.getRole() : "ROLE_CASHIER";
        Role role = roleRepository.findByName(targetRoleName)
                .orElseGet(() -> roleRepository.save(new Role(targetRoleName, "Staff role")));

        User staff = new User();
        staff.setUsername(request.getUsername().trim());
        staff.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        staff.setFullName(request.getFullName().trim());
        staff.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        staff.setCompanyCardNumber(request.getCompanyCardNumber().trim());
        staff.setActive(true);
        staff.setRoles(Collections.singleton(role));

        User saved = userRepository.save(staff);
        auditLogService.recordEvent("USER", saved.getId(), "STAFF_CREATED", adminUser, null,
                "Created staff: " + saved.getUsername() + " with card: " + saved.getCompanyCardNumber(), null);

        log.info("Created staff account '{}' by admin '{}'", saved.getUsername(), adminUser.getUsername());
        return mapToUserDto(saved);
    }

    @Transactional
    public UserDto setupInitialAdmin(SetupAdminRequest request, String setupTokenHeader) {
        if (userRepository.existsByRoles_Name("ROLE_ADMIN")) {
            throw new BusinessException("Initial administrator account already exists. Setup endpoint is disabled.", HttpStatus.FORBIDDEN);
        }

        if (adminSetupToken != null && !adminSetupToken.trim().isEmpty()) {
            if (setupTokenHeader == null || !adminSetupToken.equals(setupTokenHeader.trim())) {
                throw new BusinessException("Invalid or missing X-Setup-Token header for initial admin provisioning.", HttpStatus.FORBIDDEN);
            }
        }

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN", "Administrator")));

        User admin = new User();
        admin.setUsername(request.getUsername().trim());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setFullName(request.getFullName().trim());
        admin.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        admin.setActive(true);
        admin.setRoles(Collections.singleton(adminRole));

        User saved = userRepository.save(admin);
        auditLogService.recordEvent("USER", saved.getId(), "INITIAL_ADMIN_CREATED", saved, null,
                "Initialized initial administrator: " + saved.getUsername(), null);

        log.info("Initial administrator account '{}' initialized successfully.", saved.getUsername());
        return mapToUserDto(saved);
    }

    public UserDto mapToUserDto(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getPhone(),
                user.getCompanyCardNumber(),
                roles,
                user.isActive()
        );
    }
}
