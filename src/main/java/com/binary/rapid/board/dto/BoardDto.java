package com.binary.rapid.board.dto;

import lombok.Data;

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

    /**
     * 게시글 첨부파일 목록(상세조회 응답에서 사용)
     */
    private List<BoardFileDto> files;
}
