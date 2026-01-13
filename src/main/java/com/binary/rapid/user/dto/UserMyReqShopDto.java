package com.binary.rapid.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMyReqShopDto {
    private String id;       
    private String category;
    private String title;
    private String contents;
    private int userId;
    private LocalDateTime createDate;
    private String writerName;
}
