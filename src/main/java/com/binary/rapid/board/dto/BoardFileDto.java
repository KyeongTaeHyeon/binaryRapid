package com.binary.rapid.board.dto;

import lombok.Data;

@Data
public class BoardFileDto {
    private int id;
    private int fileSeq;
    private String fileAddr;
    private int userId;
    private String createDate;
    private String updateDate;
    private String deleteDate;
}




