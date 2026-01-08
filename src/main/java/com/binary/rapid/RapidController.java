package com.binary.rapid;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RapidController {

    // localhost:8080/login 으로 접속했을 때 실행됩니다.
    @GetMapping("/login")
    public String loginPage() {
        // src/main/resources/templates/login/login.html 파일을 찾아갑니다.
        // 폴더 구조가 login/login.html 이라면 아래와 같이 적습니다.
        return "login/login";
    }

    @GetMapping("/")
    public String indexPage() {
        return "index"; // templates/index.html
    }

    @GetMapping("/origin")
    public String originPage() {
        return "origin/origin";
    }

    @GetMapping("/board/news")
    public String newsPage() {
        return "board/news";
    }

    @GetMapping("/board/boardList")
    public String boardListPage() {
        return "board/boardList";
    }

    @GetMapping("/login/register")
    public String registerPage() {
        return "login/register";
    }

    @GetMapping("/login/userBoardList")
    public String userBoardListPage() {
        return "login/userBoardList";
    }

    @GetMapping("/manager/managerMain")
    public String managerMainPage() {
        return "manager/managerMain";
    }
}
