package com.binary.rapid.user.config;

import com.binary.rapid.user.global.jwt.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // 암호화 메서드

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/user/LocalSignin",
                                "/login/register",
                                "/user/refresh",
                                "/login",
                                "/login/user/**",      
                                "/api/ramen/**",       
                                "/shop/**",            
                                "/board/**",           
                                "/api/board/**",       
                                "/admin/users",        
                                "/admin/notices",      
                                "/admin/categories",   
                                "/user/check-duplicate", 
                                "/user/LocalSignup",
                                "/css/**", "/js/**", "/images/**", "/fragments/**", "/img/**", "/favicon.ico", "/error"
                        ).permitAll()
                        .requestMatchers("/admin/api/**").hasAuthority("ADMIN")
                        .requestMatchers("/user/logout", "/user/me", "/user/api/my/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                );

        return http.build();
    }
    
}
