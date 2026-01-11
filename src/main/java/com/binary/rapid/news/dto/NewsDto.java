package com.binary.rapid.news.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsDto {
    private int id;
    private String title;
    private String tags;
    private String links;
    private int userId;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private LocalDateTime deleteDate;
}
