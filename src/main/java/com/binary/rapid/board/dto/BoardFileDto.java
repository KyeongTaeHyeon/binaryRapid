package com.binary.rapid.board.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardFileDto {
    private int id;
    private int fileSeq;
    private String fileAddr;
    private int userId;
    private String createDate;
    private String updateDate;
    private String deleteDate;
}




