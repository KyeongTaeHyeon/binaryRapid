package com.binary.rapid.board.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BoardDto {
    private int id;
    private String category;
    private String title;
    private String contents;
    private int userId;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private LocalDateTime deleteDate;
    private String writerName;


}

