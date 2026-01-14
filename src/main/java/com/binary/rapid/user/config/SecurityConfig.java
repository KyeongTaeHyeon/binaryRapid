package com.binary.rapid.user.config;

import com.binary.rapid.user.global.jwt.JwtAuthenticationFilter;
import com.binary.rapid.user.handler.OAuth2SuccessHandler;
import com.binary.rapid.user.router.OAuth2UserProviderRouter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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
                                "/login/oauth2/**",
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
                                // approval pages - only list/detail publicly accessible
                                "/approval",
                                "/approval/",
                                "/approval/detail",
                                "/css/**", "/js/**", "/images/**", "/fragments/**", "/img/**", "/favicon.ico",
                                "/error"
                        ).permitAll()
                        // ✅ approval pages: write/edit requires login
                        .requestMatchers("/approval/write", "/approval/edit").authenticated()

                        // ✅ approval api: read-only public
                        .requestMatchers(HttpMethod.GET,
                                "/api/approval/list",
                                "/api/approval/detail/**",
                                "/api/approval/owner/**").permitAll()

                        // ✅ approval api: write requires login
                        .requestMatchers(HttpMethod.POST, "/api/approval/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/approval/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/approval/**").authenticated()
                        .requestMatchers("/admin/api/**").hasAuthority("ADMIN")
                        // 로그아웃, 토큰 갱신 등은 '인증된 사용자'만 접근 가능하도록 설정
                        // 이렇게 해야 @AuthenticationPrincipal에 데이터가 들어옵니다.
                        .requestMatchers("/user/logout", "/user/me", "/user/api/my/**").authenticated()

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserProviderRouter)
                        )
                        .successHandler(oAuth2SuccessHandler)
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            // If this is a browser page request for approval write/edit, redirect to login with a message.
                            // (We keep API requests returning 401 JSON/error as before.)
                            String accept = request.getHeader("Accept");
                            String uri = request.getRequestURI();

                            boolean isHtml = accept != null && accept.contains("text/html");
                            boolean isGet = "GET".equalsIgnoreCase(request.getMethod());
                            boolean isApprovalWriteOrEditPage = uri.equals("/approval/write") || uri.equals("/approval/edit");

                            if (isGet && isHtml && isApprovalWriteOrEditPage) {
                                String msg = URLEncoder.encode("로그인이 필요합니다.", StandardCharsets.UTF_8);
                                response.sendRedirect("/login?msg=" + msg);
                                return;
                            }

                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                );

        return http.build();
    }

}
