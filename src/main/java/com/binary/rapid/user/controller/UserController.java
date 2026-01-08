package com.binary.rapid.user.controller;

import com.binary.rapid.Board.dto.BoardDto;
import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.form.UserLoginForm;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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
    public ResponseEntity<Void>  userLocalLogin( @RequestBody UserLoginForm form, HttpSession session ) {
        
        // 1. 로그인 검증 + 사용자 조회
        UserResponseDto loginUser = service.userLocalsignin(form);

        // 2. 세션에는 "인증된 사용자 정보"만 저장
        session.setAttribute("loginUser", loginUser);
        
        return ResponseEntity.ok().build();
    }


    // 소셜 회원가입
    @PostMapping("/SocialSignup")    public ResponseEntity<Void> userSocialSignup(@RequestBody UserSignUpForm form) {

        service.localSignup(form);

        return ResponseEntity.ok().build();
    }

    // 로컬 로그아웃
    @PostMapping("/logout")
    public String localLogout(HttpSession session) {
        session.invalidate(); 
        return "redirect:/";
    }
    
    
    // 유저 게시글 관리
    @GetMapping("/api/my/board")
    @ResponseBody
    public ResponseEntity<?> myBoardList(HttpSession session) {

        UserResponseDto loginUser =
                (UserResponseDto) session.getAttribute("loginUser");

        log.info("로그인 유저 정보"+ loginUser.toString());
        
        if (loginUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("LOGIN_REQUIRED");
        }

        List<BoardDto> result =  service.getMyBoards(loginUser.getUserId());
        
        log.info("리턴된 listData"+ result);
        return ResponseEntity.ok(
                result
        );
    }

}
