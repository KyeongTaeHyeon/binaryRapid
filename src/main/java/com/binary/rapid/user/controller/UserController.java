package com.binary.rapid.user.controller;

import com.binary.rapid.user.dto.SelectUserResponseForJwtDto;
import com.binary.rapid.user.dto.UserLoginJWT;
import com.binary.rapid.user.form.UserLoginForm;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.global.common.ApiResponse;
import com.binary.rapid.user.global.jwt.JwtUtil;
import com.binary.rapid.user.handler.InvalidPasswordException;
import com.binary.rapid.user.handler.UserNotFoundException;
import org.springframework.http.HttpStatus;
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
        try {
            SelectUserResponseForJwtDto loginUser = service.userLocalsignin(form);

            String accessToken = JwtUtil.createAccessToken(loginUser.getEmail());
            String refreshToken = JwtUtil.createRefreshToken();

            // 리프레시 토큰 저장
            refreshTokenMapper.saveRefreshToken(
                    loginUser.getUserId(),
                    refreshToken,
                    LocalDateTime.now().plusDays(7)
            );

            // ✅ accessToken을 HttpOnly 쿠키로 저장
            ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                    .httpOnly(true)
                    .path("/")
                    .sameSite("Lax")
                    .secure(false)        // HTTPS면 true
                    .maxAge(60 * 60)      // 1시간
                    .build();

            response.addHeader("Set-Cookie", accessCookie.toString());

            // 기존 응답(JSON)
            UserLoginJWT responseBody = new UserLoginJWT(accessToken, refreshToken, loginUser);
            return ResponseEntity.ok(ApiResponse.success(responseBody));

        } catch (UserNotFoundException e) {
            // 프론트가 response.json()을 호출해도 깨지지 않도록 반드시 JSON으로 내려줌
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.fail("404", e.getMessage()));

        } catch (InvalidPasswordException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("401", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("400", e.getMessage()));

        } catch (Exception e) {
            log.error("LocalSignin failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("500", "로그인 처리 중 오류가 발생했습니다."));
        }
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

        return ResponseEntity.ok(ApiResponse.success(tokens));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String authHeader = request.getHeader("Authorization");
        String accessToken = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        } else {
            // Authorization 헤더가 없으면 쿠키에서 accessToken 확인
            if (request.getCookies() != null) {
                for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                    if ("accessToken".equals(c.getName())) {
                        accessToken = c.getValue();
                        break;
                    }
                }
            }
        }

        // userDetails는 SecurityContext에 의해 설정되어 있어야 함(설정상 authenticated 요구)
        int userId = userDetails != null && userDetails.getUser() != null ? userDetails.getUser().getUserId() : 0;

        // 서비스에 로그아웃 처리 위임 (accessToken이 null이어도 리프레시 토큰 삭제는 수행되도록 처리됨)
        service.logout(userId, accessToken);

        // accessToken 쿠키 만료 응답
        ResponseCookie expired = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", expired.toString());

        return ResponseEntity.ok(ApiResponse.success("로그아웃 성공"));
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
