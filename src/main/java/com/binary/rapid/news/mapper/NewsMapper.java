package com.binary.rapid.news.mapper;

import com.binary.rapid.news.dto.NewsDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NewsMapper {
    List<NewsDto> showNews(@Param("tags") String tags,
                           @Param("size") int size,
                           @Param("offset") int offset);
    int countNews(@Param("tags") String tags);
}
