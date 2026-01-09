package com.binary.rapid.board.dto;

import lombok.Getter;
import lombok.Setter;

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

