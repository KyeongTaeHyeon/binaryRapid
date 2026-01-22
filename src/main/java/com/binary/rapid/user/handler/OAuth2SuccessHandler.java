package com.binary.rapid.user.handler;

import com.binary.rapid.user.constant.TokenExpiration;
import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.global.jwt.JwtUtil;
import com.binary.rapid.user.global.security.CustomUserDetails;
import com.binary.rapid.user.mapper.RefreshTokenMapper;
import com.binary.rapid.user.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // 1. Principal 캐스팅 및 정보 추출
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String email = userDetails.getUser().getEmail();
        String name = userDetails.getUser().getName();


        // 2. DB에서 실제 가입 여부 확인
        UserResponseDto existingUser = userMapper.selectUserToUserResponseDto(email);

        // [핵심 로직] 신규 유저 판별
        // DB에 없거나, 닉네임/취향 등 필수 정보가 아직 '기본' 상태라면 가입 페이지로 유도
        if (existingUser == null || existingUser.getUserId() == 0 || "기본".equals(existingUser.getTaste())) {

            String targetUrl = UriComponentsBuilder.fromUriString("/login/register")
                    .queryParam("email", email)
                    .queryParam("name", name)
                    .queryParam("social", "GOOGLE")
                    .build()
                    .encode(StandardCharsets.UTF_8)
                    .toUriString();

            response.sendRedirect(targetUrl);
            return; 
        }


        String accessToken = jwtUtil.createAccessToken(email);
        String refreshToken = jwtUtil.createRefreshToken();

        // Refresh Token DB 저장
        refreshTokenMapper.saveRefreshToken(
                existingUser.getUserId(),
                refreshToken,
                TokenExpiration.REFRESH_TOKEN.toLocalDateTime()
        );

        // 3. 메인 페이지로 리다이렉트 (토큰 포함)
        // common.js에서 이 파라미터들을 읽어서 localStorage에 저장합니다.
        String targetUrl = UriComponentsBuilder.fromUriString("/")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();

        response.sendRedirect(targetUrl);
    }
}