package com.binary.rapid.user.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/login")
public class UserLoginController {
    @GetMapping("")
    public String loginPage() {
        // src/main/resources/templates/login/login.html 파일을 찾아갑니다.
        // 폴더 구조가 login/login.html 이라면 아래와 같이 적습니다.
        return "login/login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "login/register";
    }

    @GetMapping("/user/boardList")
    public String userBoardListPage(Model model) {
        model.addAttribute("pageName", "board");
        return "login/userBoardList";
    }

    @GetMapping("/user/modify")
    public String userInfoModify(Model model) {
        model.addAttribute("pageName", "modify");
        return "login/userModify";
    }

    @GetMapping("/user/mywish")
    public String userMywish(Model model) {
        model.addAttribute("pageName", "wish");
        return "login/userMywish";
    }

    @GetMapping("/user/requestShop")
    public String userRequestShop(Model model) {
        model.addAttribute("pageName", "request");
        return "login/userRequestShop";
    }
}
