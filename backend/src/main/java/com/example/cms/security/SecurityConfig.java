package com.example.cms.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(cors ->
                cors.configurationSource(corsConfigurationSource())
            )
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )
            .authorizeHttpRequests(auth -> auth

                // Allow CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public authentication endpoints
                .requestMatchers("/api/v1/auth/**").permitAll()

                // Public course endpoints
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/public/courses",
                    "/api/v1/public/courses/**"
                ).permitAll()

                // Other explicitly public endpoints
                .requestMatchers("/api/v1/public/**").permitAll()

                // API documentation
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // Health endpoints
                .requestMatchers(
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()

                // Admin endpoints
                .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")

                // Instructor endpoints
                .requestMatchers("/api/v1/instructor/**")
                    .hasRole("INSTRUCTOR")

                // Student endpoints
                .requestMatchers("/api/v1/student/**")
                    .hasRole("STUDENT")

                // Course management
                .requestMatchers("/api/v1/courses/**")
                    .hasAnyRole("ADMIN", "INSTRUCTOR")

                // Category management
                .requestMatchers("/api/v1/categories/**")
                    .hasRole("ADMIN")

                // User management
                .requestMatchers("/api/v1/users/**")
                    .hasRole("ADMIN")

                // Enrollment endpoints
                .requestMatchers("/api/v1/enrollments/**")
                    .hasAnyRole(
                        "ADMIN", "INSTRUCTOR", "STUDENT"
                    )

                // Notifications
                .requestMatchers("/api/v1/notifications/**")
                    .authenticated()

                // Audit logs
                .requestMatchers("/api/v1/audit/**")
                    .hasRole("ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = Arrays.stream(
                    allowedOrigins.split(",")
                )
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .collect(Collectors.toList());

        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH",
            "DELETE", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
