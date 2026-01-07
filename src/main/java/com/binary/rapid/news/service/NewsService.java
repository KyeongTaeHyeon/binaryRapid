package com.binary.rapid.news.service;

import com.binary.rapid.news.dto.NewsDto;
import com.binary.rapid.news.mapper.NewsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class NewsService {
    private final NewsMapper newsMapper;

    public List<NewsDto> showNews() {
        return newsMapper.showNews();
    }
}
