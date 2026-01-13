package com.binary.rapid.board.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCommentDto {
    private int id;
    private int commentSeq;
    private String comment;
    private int userId;
    private String userName; // ✅ 닉네임을 담을 필드 추가 (Camel Case)
    private String createDate;
    private String updateDate;
    private String deleteDate;
}

