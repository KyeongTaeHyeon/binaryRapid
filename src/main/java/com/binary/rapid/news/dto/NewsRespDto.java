package com.binary.rapid.news.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewsRespDto {
    private List<NewsDto> newsList;
    private int totalItems;
}
