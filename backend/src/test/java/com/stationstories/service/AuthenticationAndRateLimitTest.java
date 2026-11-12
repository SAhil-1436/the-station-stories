package com.stationstories.service;

import com.stationstories.dto.auth.CreateStaffRequest;
import com.stationstories.dto.auth.LoginRequest;
import com.stationstories.dto.auth.SetupAdminRequest;
import com.stationstories.dto.auth.UserDto;
import com.stationstories.entity.Role;
import com.stationstories.entity.User;
import com.stationstories.exception.BusinessException;
import com.stationstories.repository.RoleRepository;
import com.stationstories.repository.UserRepository;
import com.stationstories.security.JwtTokenProvider;
import com.stationstories.security.LoginRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationAndRateLimitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Spy
    private LoginRateLimiter loginRateLimiter = new LoginRateLimiter();

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User("admin", "$2a$12$hash", "Admin Manager", "9876543210", "TSS-ADMIN-001");
        adminUser.setId(1L);
        adminUser.setRoles(Collections.singleton(new Role("ROLE_ADMIN", "Admin")));
    }

    @Test
    @DisplayName("Should block user after 5 consecutive failed login attempts")
    void testLoginRateLimitingBlock() {
        String testIp = "192.168.1.100";
        LoginRequest request = new LoginRequest("cashier", "wrongpass");

        when(userRepository.findByUsername("cashier")).thenReturn(Optional.empty());

        // Perform 5 failed attempts
        for (int i = 0; i < 5; i++) {
            assertThatThrownBy(() -> authService.login(request, testIp))
                    .isInstanceOf(BadCredentialsException.class);
        }

        // 6th attempt is blocked by rate limiter
        assertThatThrownBy(() -> authService.login(request, testIp))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Too many failed login attempts");
    }

    @Test
    @DisplayName("Should require company card verification number when creating a staff account")
    void testStaffCreationRequiresCompanyCard() {
        CreateStaffRequest request = new CreateStaffRequest();
        request.setUsername("newcashier");
        request.setPassword("password123");
        request.setFullName("Cashier Person");
        request.setCompanyCardNumber(null); // Missing company card

        assertThatThrownBy(() -> authService.createStaff(request, adminUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Company card verification number is mandatory");
    }

    @Test
    @DisplayName("Should prevent creating a staff account with an existing username")
    void testStaffCreationDuplicateUsername() {
        CreateStaffRequest request = new CreateStaffRequest();
        request.setUsername("existinguser");
        request.setPassword("password123");
        request.setFullName("Cashier Person");
        request.setCompanyCardNumber("TSS-CARD-999");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        assertThatThrownBy(() -> authService.createStaff(request, adminUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    @DisplayName("Should block initial admin setup if an administrator account already exists")
    void testBlockDuplicateAdminSetup() {
        when(userRepository.existsByRoles_Name("ROLE_ADMIN")).thenReturn(true);

        SetupAdminRequest request = new SetupAdminRequest();
        request.setUsername("newadmin");
        request.setPassword("password123");
        request.setFullName("New Admin");

        assertThatThrownBy(() -> authService.setupInitialAdmin(request, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Initial administrator account already exists");
    }

    @Test
    @DisplayName("Should create staff account when company card and valid credentials are provided")
    void testSuccessfulStaffCreation() {
        CreateStaffRequest request = new CreateStaffRequest();
        request.setUsername("cashier2");
        request.setPassword("SecretPass123");
        request.setFullName("Jane Cashier");
        request.setCompanyCardNumber("TSS-EMP-002");
        request.setRole("ROLE_CASHIER");

        when(userRepository.existsByUsername("cashier2")).thenReturn(false);
        when(roleRepository.findByName("ROLE_CASHIER")).thenReturn(Optional.of(new Role("ROLE_CASHIER", "Cashier")));
        when(passwordEncoder.encode("SecretPass123")).thenReturn("$2a$12$encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(20L);
            return u;
        });

        UserDto created = authService.createStaff(request, adminUser);

        assertThat(created.getId()).isEqualTo(20L);
        assertThat(created.getUsername()).isEqualTo("cashier2");
        assertThat(created.getCompanyCardNumber()).isEqualTo("TSS-EMP-002");
        assertThat(created.getRoles()).contains("ROLE_CASHIER");
    }
}
