package com.stationstories;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.datasource.url=jdbc:mysql://localhost:3306/the_station_stories?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true",
        "spring.datasource.username=root",
        "spring.datasource.password=${DB_PASSWORD}",
        "app.security.jwt.secret=${JWT_SECRET}"
})
class StationStoriesApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring Boot context initializes cleanly
    }
}
