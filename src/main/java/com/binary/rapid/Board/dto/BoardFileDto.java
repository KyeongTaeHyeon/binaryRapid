package com.binary.rapid.Board.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

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




