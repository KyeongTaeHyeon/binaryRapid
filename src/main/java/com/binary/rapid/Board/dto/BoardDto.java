package com.binary.rapid.Board.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

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

