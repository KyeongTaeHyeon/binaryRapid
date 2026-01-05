package com.binary.rapid.Board.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class BoardDto {
    private int id;
    private String category;
    private String title;
    private String content;
    private int userId;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private LocalDateTime deleteDate;
    //화면 표시용 추가 필드 (닉넴)
    private String writerName;

}

