package com.binary.rapid.admin.dto;

import lombok.Data;

@Data
public class AdminSearchCondition {
    private String category;   // 카테고리
    private String keyword;    // 검색어
    private String startDate;  // 시작일
    private String endDate;    // 종료일
}
