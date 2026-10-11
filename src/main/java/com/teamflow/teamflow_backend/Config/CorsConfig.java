
package com.teamflow.teamflow_backend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Allow requests from the React + Vite frontend
        config.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        // Allow these HTTP methods
        config.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        // Allow request headers such as Content-Type
        config.setAllowedHeaders(List.of("*"));

        // We are not using cookie-based authentication yet
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        // Apply this configuration to all API paths
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
