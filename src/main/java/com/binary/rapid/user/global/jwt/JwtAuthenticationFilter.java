package com.binary.rapid.user.global.jwt;

import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.global.security.CustomUserDetails;
import com.binary.rapid.user.mapper.UserMapper;
import com.binary.rapid.user.service.JwtBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final JwtBlacklistService blacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;

        // ✅ 1) Authorization 헤더 우선
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // ✅ 2) 헤더가 없으면 쿠키에서 accessToken 찾기 (Thymeleaf 페이지 요청 대응)
        if (token == null) {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie c : cookies) {
                    if ("accessToken".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
        }

        // 토큰이 없으면 그냥 통과 (익명)
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 1. 블랙리스트 확인
            if (blacklistService.isBlacklisted(token)) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "로그아웃된 토큰입니다.");
                return;
            }

            // 2. 토큰 유효성 검증 (만료 체크 포함)
            if (jwtUtil.validateToken(token)) {
                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    String email = jwtUtil.getEmailFromToken(token);
                    UserResponseDto user = userMapper.selectUserToUserResponseDto(email);

                    if (user != null) {
                        CustomUserDetails customUserDetails = new CustomUserDetails(user);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        customUserDetails,
                                        null,
                                        customUserDetails.getAuthorities()
                                );

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } else {
                // 토큰이 유효하지 않거나 만료된 경우
                if (!request.getRequestURI().equals("/user/refresh")) {
                    sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "유효하지 않거나 만료된 토큰입니다.");
                    return;
                }
            }

        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "인증 과정에서 오류가 발생했습니다.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(String.format("{\"success\":false, \"code\":\"%d\", \"message\":\"%s\"}", status, message));
    }
}
