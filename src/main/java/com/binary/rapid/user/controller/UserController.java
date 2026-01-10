package com.binary.rapid.user.controller;

import com.binary.rapid.user.dto.SelectUserResponseForJwtDto;
import com.binary.rapid.user.dto.UserLoginJWT;
import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.form.UserLoginForm;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.global.common.ApiResponse;
import com.binary.rapid.user.global.jwt.JwtUtil;
import com.binary.rapid.user.global.security.CustomUserDetails;
import com.binary.rapid.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


@Slf4j
@Controller
@ResponseBody
@RequestMapping("/user")
public class UserController {

    @Autowired
    UserService service;

    // 로컬 회원가입
    @PostMapping("/LocalSignup")
    public ResponseEntity<Void> userLocalSignup(@RequestBody UserSignUpForm form) {

        service.localSignup(form);

        return ResponseEntity.ok().build();
    }

    // 로컬 로그인
    @PostMapping("/LocalSignin")
    public ResponseEntity<UserLoginJWT>  userLocalLogin( @RequestBody UserLoginForm form) {
        
        // 1. 로그인 검증 + 사용자 조회
        SelectUserResponseForJwtDto loginUser = service.userLocalsignin(form);
        // 토큰 생성
        String token = JwtUtil.createToken(loginUser.getEmail());

        UserLoginJWT response = new UserLoginJWT(token, loginUser);
        
/*        // 2. 세션에는 "인증된 사용자 정보"만 저장
        session.setAttribute("loginUser", loginUser);
        */
        return ResponseEntity.ok(response);
    }


    // 소셜 회원가입
    @PostMapping("/SocialSignup")    
    public ResponseEntity<Void> userSocialSignup(@RequestBody UserSignUpForm form) {

        service.localSignup(form);

        return ResponseEntity.ok().build();
    }

    // 로컬 로그아웃
    @PostMapping("/logout")
    public String localLogout(HttpSession session) {
        session.invalidate(); 
        return "redirect:/";
    }


    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SelectUserResponseForJwtDto>> getMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 1. 반환 타입을 ResponseEntity<UserResponseDto>로 명시
        // 2. ApiResponse.success() 없이 결과 객체만 바로 전달
        ApiResponse<SelectUserResponseForJwtDto> response = ApiResponse.success(SelectUserResponseForJwtDto.from(userDetails.getUser()));

        return ResponseEntity.ok(response);
    }

}
