package com.binary.rapid.Board.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCommentDto {
private int id;
private int comment_seq;
private String comment;
private int userId; //작성
private Integer parentId; // 부모 댓글번호 (대댓글 경우 사용, 일반댓글null)
private String create_date;
private String update_date;
private String delete_date;
}

