package com.binary.rapid.news.controller;

import com.binary.rapid.news.dto.NewsDto;
import com.binary.rapid.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;


@GetMapping("/api/news")
public Map<String, Object> getNews( // List 대신 Map으로 반환 타입 변경
                                    @RequestParam int page,
                                    @RequestParam int size,
                                    @RequestParam String tags
){
    int offset = (page - 1) * size;

    // 변수명 통일: XML 파라미터명과 맞추기 위해 tags라는 키로 넘깁니다.
    List<NewsDto> list = newsService.showNews(tags, size, offset);
    int totalItems = newsService.countNews(tags);

    Map<String, Object> response = new HashMap<>(); // ListDto가 아닌 HashMap 사용
    response.put("newsList", list);
    response.put("totalItems", totalItems);

    return response; // 최종적으로 맵 하나만 반환
}

}
