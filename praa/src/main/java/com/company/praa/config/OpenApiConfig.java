package com.company.praa.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PRAA - Project Resource Allocation Management API")
                        .description("""
                                API for managing resource allocation across projects.
                                
                                Features:
                                - Employee CRUD
                                - Project CRUD
                                - Resource Allocation with business rules:
                                  1. Allocation must be between 1% and 100%
                                  2. Total allocation per employee must not exceed 100%
                                  3. Cannot allocate to COMPLETED projects
                                - Reports: utilization, available resources, overloaded employees
                                """)
                        .version("1.0"));
    }
}