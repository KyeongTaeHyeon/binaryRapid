package com.binary.rapid.user.global.jwt;

import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.global.security.CustomUserDetails;
import com.binary.rapid.user.mapper.UserMapper;
import com.binary.rapid.user.service.JwtBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

        String authHeader = request.getHeader("Authorization");

        // 1. 요청 경로(URI)를 가져오는 이 코드가 필요합니다!
        String path = request.getRequestURI();

        // 2. 인증 없이 통과시켜줄 경로 설정
        // 회원가입 페이지(/user/register)와 소셜 가입 로직은 토큰 검사를 건너뜁니다.
        if (path.contains("/user/register") ||
                path.contains("/user/LocalSignup") ||
                path.contains("/user/check-duplicate") ||
                path.equals("/login") ||
                path.equals("/")) {

            filterChain.doFilter(request, response);
            return; // 필터 로직 종료 (다음 필터로 이동)
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

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
                        System.out.println("추출된 이메일: " + email);
                        UserResponseDto user = userMapper.selectUserToUserResponseDto(email);
                        System.out.println("DB 조회 결과: " + (user != null ? "성공" : "실패(null)"));

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
                    // 토큰이 유효하지 않거나 만료된 경우 (validateToken이 false를 줄 때)
                    // /user/refresh 경로라면 일단 필터를 통과시켜서 컨트롤러에서 RefreshToken을 검사하게 할 수도 있습니다.
                    if (!request.getRequestURI().equals("/user/refresh")) {
                        sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "유효하지 않거나 만료된 토큰입니다.");
                        return;
                    }
                }
            } catch (Exception e) {
                // 그 외 예상치 못한 에러 처리
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "인증 과정에서 오류가 발생했습니다.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    // 에러 응답용 공통 메서드
    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(String.format("{\"success\":false, \"code\":\"%d\", \"message\":\"%s\"}", status, message));
    }
}