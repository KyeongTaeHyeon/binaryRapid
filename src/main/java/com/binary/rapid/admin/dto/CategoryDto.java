package com.binary.rapid.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryDto {
    private String id;          // PK (예: C1, G1 - 문자열)
    private String groupId;     // 그룹코드 (예: kind, region)
    private String major;       // 대분류 (예: 종류, 지역)
    private String minor;       // 소분류 (예: 종류, 카테고리, 농도)
    private String name;        // 카테고리명 (예: 츠케멘, 서울)
    private int view;           // 정렬순서
    private int userId;         // 등록자 ID

    private LocalDateTime createDate;
    private LocalDateTime updateDate;

    // 화면 표시용 (그룹ID + 대분류명 조합)
    public String getGroupLabel() {
        return major + " (" + groupId + ")";
    }
}
