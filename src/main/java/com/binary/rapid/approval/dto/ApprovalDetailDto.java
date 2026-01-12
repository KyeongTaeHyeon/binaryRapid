package com.binary.rapid.approval.dto;

import lombok.Data;
import java.util.List;

@Data
public class ApprovalDetailDto {
    private String id;
    private String name;
    private String address;
    private String content;
    private String writerName;
    private String createDate;       // 날짜 출력을 위해 추가
    private List<String> categories; // tb_category의 name 리스트 (필터)
    private List<ShopImageDto> images; // 아래 내부 클래스 사용

    // 별도 파일이 아닌 ApprovalDetailDto 안에 포함된 구조입니다.
    @Data
    public static class ShopImageDto {
        private int imgSeq;     // 이미지 순번
        private String imgUrl;  // 이미지 경로
        private String mainImg; // Y/N 여부
    }
}