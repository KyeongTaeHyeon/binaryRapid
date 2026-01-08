package com.binary.rapid.Board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BoardViewController {


    // 2. 글쓰기 페이지 (지금 보여주신 HTML 파일명이 boardList4.html 이라면)
    @GetMapping("/board/write")
    public String boardWritePage() {
        // templates/board/boardList4.html 인 경우
        return "board/boardList4";
    }
    @GetMapping("/board/boardEdit")
    public String boardEditPage() {
        return "board/boardEdit";
    }
}