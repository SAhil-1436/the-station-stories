package com.stationstories.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("The Station Stories REST API")
                        .version("1.0.0")
                        .description("Official backend REST API platform for The Station Stories restaurant management system")
                        .contact(new Contact()
                                .name("The Station Stories Management")
                                .email("contact@thestationstories.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://thestationstories.com")));
    }
}
