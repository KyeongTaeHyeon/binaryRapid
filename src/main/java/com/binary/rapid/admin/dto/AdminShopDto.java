package com.binary.rapid.admin.dto;

import lombok.Data;

@Data
public class AdminShopDto { // [수정] 클래스명에 Admin 붙임
    private String id;          // 식당 ID
    private String name;        // 식당명
    private String address;     // 주소
    private String content;     // 설명
    private String reqType;     // 승인 상태 (NULL:대기, Y:승인, N:거절)
    private int reqUserId;      // 요청한 유저 ID
    private int userId;         // 소유주 ID
    private String createDate;  // 신청일
    private String updateDate;
}
