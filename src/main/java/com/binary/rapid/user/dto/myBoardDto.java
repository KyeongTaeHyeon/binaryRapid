package com.binary.rapid.user.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class myBoardDto {


    // board테이블의 pk
    private int id;
    private String category;
    private String title;
    private String contents;
    // user테이블의 pk 
    private int userId;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private LocalDateTime deleteDate;
    private String writerName;
    
    // 유저 테이블에서 조인해 오는 데이터
    // 로그인한 유저의 로그인 아이디
    private String userLoginId;
    // 유저의 이름
    private String userName;
    

}
