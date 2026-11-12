package com.stationstories.config;

import com.stationstories.entity.Role;
import com.stationstories.entity.User;
import com.stationstories.repository.RoleRepository;
import com.stationstories.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.initial-admin.username:admin}")
    private String initialAdminUsername;

    @Value("${INITIAL_ADMIN_PASSWORD:}")
    private String initialAdminPassword;

    @Value("${app.security.initial-admin.full-name:Restaurant Administrator}")
    private String initialAdminFullName;

    public AdminInitializer(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        boolean adminExists = userRepository.existsByRoles_Name("ROLE_ADMIN");
        if (adminExists) {
            log.info("Administrator account already exists. Skipping auto-initialization.");
            return;
        }

        if (initialAdminPassword != null && !initialAdminPassword.trim().isEmpty()) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN", "Administrator")));

            User admin = new User();
            admin.setUsername(initialAdminUsername.trim());
            admin.setPasswordHash(passwordEncoder.encode(initialAdminPassword.trim()));
            admin.setFullName(initialAdminFullName.trim());
            admin.setCompanyCardNumber("TSS-ADMIN-001");
            admin.setActive(true);
            admin.setRoles(Collections.singleton(adminRole));

            userRepository.save(admin);
            log.info("Initialized secure administrator account '{}' from environment configuration.", initialAdminUsername);
        } else {
            log.warn("No administrator account exists and INITIAL_ADMIN_PASSWORD was not supplied. " +
                     "Please set INITIAL_ADMIN_PASSWORD in your environment or call POST /api/v1/auth/setup-admin.");
        }
    }
}
