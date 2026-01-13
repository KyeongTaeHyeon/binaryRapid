package com.binary.rapid.user.controller;

import com.binary.rapid.user.dto.SelectUserResponseForJwtDto;
import com.binary.rapid.user.dto.UserLoginJWT;
import com.binary.rapid.user.form.UserLoginForm;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.global.common.ApiResponse;
import com.binary.rapid.user.global.jwt.JwtUtil;
import com.binary.rapid.user.global.security.CustomUserDetails;
import com.binary.rapid.user.mapper.RefreshTokenMapper;
import com.binary.rapid.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Controller
@ResponseBody
@RequestMapping("/user")
public class UserController {

    @Autowired
    UserService service;
    @Autowired
    JwtUtil jwtUtil;
    @Autowired
    RefreshTokenMapper refreshTokenMapper;

    // 로컬 회원가입
    @PostMapping("/LocalSignup")
    public ResponseEntity<ApiResponse<Void>> userLocalSignup(@RequestBody UserSignUpForm form) {
        service.localSignup(form);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 로컬 로그인
    @PostMapping("/LocalSignin")
    public ResponseEntity<ApiResponse<UserLoginJWT>> userLocalLogin(
            @RequestBody UserLoginForm form,
            HttpServletResponse response
    ) {
        SelectUserResponseForJwtDto loginUser = service.userLocalsignin(form);

        String accessToken = JwtUtil.createAccessToken(loginUser.getEmail());
        String refreshToken = JwtUtil.createRefreshToken();

        // 리프레시 토큰 저장
        refreshTokenMapper.saveRefreshToken(
                loginUser.getUserId(),
                refreshToken,
                LocalDateTime.now().plusDays(7)
        );

        // ✅ 핵심: accessToken을 HttpOnly 쿠키로 저장 (페이지 이동/Thymeleaf에서도 인증 가능)
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .path("/")
                .sameSite("Lax")
                .secure(false)        // HTTPS면 true
                .maxAge(60 * 60)      // 1시간 (원하는 값으로 조절)
                .build();

        response.addHeader("Set-Cookie", accessCookie.toString());

        // 기존 응답(JSON)도 유지 (프론트 localStorage 방식도 당장 깨지지 않게)
        UserLoginJWT responseBody = new UserLoginJWT(accessToken, refreshToken, loginUser);
        return ResponseEntity.ok(ApiResponse.success(responseBody));
    }

    // 소셜 회원가입
    @PostMapping("/SocialSignup")
    public ResponseEntity<Void> userSocialSignup(@RequestBody UserSignUpForm form) {
        service.localSignup(form);
        return ResponseEntity.ok().build();
    }

    // 토큰 재발급
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refresh(@RequestBody Map<String, Object> params) {

        if (params.get("userId") == null || params.get("refreshToken") == null) {
            log.error("토큰 재발급 실패: userId 또는 refreshToken 누락");
            return ResponseEntity.status(400).body(ApiResponse.fail("400", "필수 파라미터가 누락되었습니다."));
        }

        int userId = Integer.parseInt(params.get("userId").toString());
        String refreshToken = (String) params.get("refreshToken");

        String savedToken = refreshTokenMapper.findTokenByUserId(userId);

        if (savedToken == null || !savedToken.equals(refreshToken) || !jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body(ApiResponse.fail("401", "유효하지 않은 토큰입니다. 다시 로그인해주세요."));
        }

        String email = service.getEmailByUserId(userId);
        String newAccessToken = JwtUtil.createAccessToken(email);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", newAccessToken);

        log.info("유저 {} 토큰 재발급 성공", userId);
        return ResponseEntity.ok(ApiResponse.success(tokens));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request
    ) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            service.logout(userDetails.getUser().getUserId(), accessToken);
            return ResponseEntity.ok(ApiResponse.success("로그아웃 성공"));
        }

        return ResponseEntity.badRequest().body(ApiResponse.fail("400", "잘못된 요청입니다."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SelectUserResponseForJwtDto>> getMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        SelectUserResponseForJwtDto user = SelectUserResponseForJwtDto.from(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<ApiResponse<Boolean>> checkDuplicate(
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String nickName
    ) {
        boolean isDuplicate = false;
        if (id != null) isDuplicate = service.isIdDuplicate(id);
        else if (email != null) isDuplicate = service.isEmailDuplicate(email);
        else if (nickName != null) isDuplicate = service.isNickNameDuplicate(nickName);

        return ResponseEntity.ok(ApiResponse.success(isDuplicate));
    }
}
