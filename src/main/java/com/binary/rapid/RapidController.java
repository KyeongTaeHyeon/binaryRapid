package com.binary.rapid;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RapidController {

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
}
