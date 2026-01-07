package com.binary.rapid.Board.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BoardFileDto {
private int id;
private int file_seq;
private String file_addr;
private int userId;
private String create_date;
private String update_date;
private String delete_date;
}



