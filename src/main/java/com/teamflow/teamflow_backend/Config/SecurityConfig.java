package com.teamflow.teamflow_backend.Config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import com.teamflow.teamflow_backend.Security.CustomUserDetailsService;
import com.teamflow.teamflow_backend.Security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration // tells spring this class contains configuration
@RequiredArgsConstructor // lombok provides this, no need to write contorllers explicitly
public class SecurityConfig {
    private final CustomUserDetailsService customUserDetailsService;
    private  final JwtAuthenticationFilter jwtAuthenticationFilter;
    @Bean // tells spring Create this object and keep it in the Spring container so other classes can use it
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(); // a class that uses Password Encoder interface...
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login","/auth/register").permitAll()
                        .requestMatchers("/api/users/allusers").hasRole("ADMIN")
                        .requestMatchers("/api/projects/create").hasAnyRole("ADMIN","MANAGER")

                        .requestMatchers("/api/projects/update/{id}").hasAnyRole("ADMIN","MANAGER")
                        .requestMatchers("/api/projects/delete/{id}").hasAnyRole("ADMIN","MANAGER")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                        )
                                .accessDeniedHandler((request, response, accessDeniedException) ->
                                        response.setStatus(HttpServletResponse.SC_FORBIDDEN)
                                )
                );
        return http.build();// This returns a DefaultSecurityFilterChain object
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception{
        return configuration.getAuthenticationManager(); // AuthenticationConfiguration is the factory that builds and provides the AuthenticationManager
    }

}
