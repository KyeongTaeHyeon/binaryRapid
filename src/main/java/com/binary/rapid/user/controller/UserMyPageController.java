package com.binary.rapid.user.controller;

import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.dto.myBoardDto;
import com.binary.rapid.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@Slf4j
@ResponseBody
@RequestMapping("/user/api/my")
@RestController
public class UserMyPageController {

    @Autowired
    UserService service;

    // 유저마이 페이지 게시글 관리
    @GetMapping("/board")
    public ResponseEntity<?> myBoardList(HttpSession session) {

        UserResponseDto loginUser =
                (UserResponseDto) session.getAttribute("loginUser");


        if (loginUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("LOGIN_REQUIRED");
        }

        List<myBoardDto> result =  service.getMyBoards(loginUser.getUserId());

        log.info("리턴된 listData"+ result);
        return ResponseEntity.ok(
                result
        );
        
    }
    // 유저 마이페이지 개인정보 변경
    public ResponseEntity<?> updateMyInfo(HttpSession session) {

        UserResponseDto loginUser =
                (UserResponseDto) session.getAttribute("loginUser");

        log.info("로그인 유저 정보"+ loginUser.toString());

        if (loginUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("LOGIN_REQUIRED");
        }

        UserResponseDto result =  service.updateMyInfo(loginUser);
        
        return  ResponseEntity.ok(
                result
        );
    }

}
