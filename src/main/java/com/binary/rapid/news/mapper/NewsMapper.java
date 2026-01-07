package com.binary.rapid.news.mapper;

import com.binary.rapid.news.dto.NewsDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NewsMapper {
    List<NewsDto> showNews();
}
