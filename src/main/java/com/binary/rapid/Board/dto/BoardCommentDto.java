package com.binary.rapid.Board.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BoardCommentDto {
    private int id;
    private int commentSeq;
    private String comment;
    private int userId; //작성
    private String createDate;
    private String updateDate;
    private String deleteDate;
}

