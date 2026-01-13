package com.binary.rapid.board.controller;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.binary.rapid.user.global.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/board")
public class BoardViewController {

    @GetMapping("/boardList")
    public String boardListPage() {
        return "board/boardList";
    }

    @GetMapping("/boardDetail")
    public String boardDetailPage() {
        return "board/boardDetail";
    }

    // 2. 글쓰기 페이지 (지금 보여주신 HTML 파일명이 boardWrite.html 이라면)
    @GetMapping("/write")
    public String boardWritePage() {
        // templates/board/boardWrite.html 인 경우
        return "board/boardWrite";
    }

    @GetMapping("/boardEdit")
    public String boardEditPage() {
        return "board/boardEdit";
    }

    @GetMapping("/restaurantApply")
    public String restaurantApply() {
        // src/main/resources/templates/board/restaurantApply.html 파일을 찾아갑니다.
        return "board/restaurantApply";
    }
}
