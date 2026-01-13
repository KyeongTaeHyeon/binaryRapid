package com.binary.rapid.user.config;

import com.binary.rapid.user.global.jwt.JwtAuthenticationFilter;
import com.binary.rapid.user.handler.OAuth2SuccessHandler;
import com.binary.rapid.user.router.OAuth2UserProviderRouter;
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
    private final OAuth2UserProviderRouter oAuth2UserProviderRouter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

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
                                "/css/**", "/js/**", "/images/**", "/fragments/**", "/img/**", "/favicon.ico", "/error",
                                "/login/oauth2/**", "/login/oauth2/**",
                                "/login/user/**",
                                "/api/ramen/**",
                                "/shop/**",
                                "/board/**",
                                "/api/board/**",
                                "/approval/**",
                                "/css/**", "/js/**", "/images/**", "/fragments/**", "/img/**", "/favicon.ico",
                                "/error"
                        ).permitAll()
                        .requestMatchers("/admin/api/**").hasAuthority("ADMIN")
                        .requestMatchers("/user/logout", "/user/me", "/user/api/my/**").authenticated()

                        // 로그아웃, 토큰 갱신 등은 '인증된 사용자'만 접근 가능하도록 설정
                        // 이렇게 해야 @AuthenticationPrincipal에 데이터가 들어옵니다.
                        .requestMatchers("/user/logout", "/user/me", "/user/api/my/**").authenticated()

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserProviderRouter) // 사용자 정보 받아오기
                        ).successHandler(oAuth2SuccessHandler) // JWT 발급 및 응답
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
