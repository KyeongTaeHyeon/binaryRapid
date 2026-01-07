package com.binary.rapid.news.controller;

import com.binary.rapid.news.dto.NewsDto;
import com.binary.rapid.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    @GetMapping("/api/news")
    public List<NewsDto> getNews(){
        return newsService.showNews();
    }
}
