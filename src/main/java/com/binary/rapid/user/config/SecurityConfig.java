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

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CSRF 비활성화: REST API(fetch) 방식에서는 보통 끕니다.
                .csrf(csrf -> csrf.disable())

                // 2. 세션 정책: JWT를 사용한다면 STATELESS가 정석입니다.
                // 만약 기존 세션 방식을 병행하려면 IF_REQUIRED로 설정하세요.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 3. 인가 규칙 (권한 설정)
                .authorizeHttpRequests(auth -> auth
                        // 로그인, 회원가입, 정적 리소스(CSS/JS)는 모두 허용
                        .requestMatchers(
                                "/", "/user/LocalSignin", "/user/**",
                                "/css/**", "/js/**", "/images/**", "/fragments/**"
                        ).permitAll()
                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )

                // 4. JWT 필터 위치 지정
                // 아이디/비번 검증 필터(UsernamePasswordAuthenticationFilter) 앞에 JWT 검사 필터를 둡니다.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 5. 예외 처리: 인증되지 않은 사용자가 접근할 때 401 에러를 응답 (JSON 방식에 필수)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                );

        return http.build();
    }
}