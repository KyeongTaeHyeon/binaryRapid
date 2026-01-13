package com.binary.rapid.board.dto;

import lombok.Data;
@Data
public class BoardCommentDto {
    private int id;
    private int commentSeq;
    private String comment;
    private int userId; //작성
    private String createDate;
    private String updateDate;
    private String deleteDate;
}

