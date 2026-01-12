package com.binary.rapid.approval.dto;

import lombok.Data;
import java.time.LocalDateTime;


@Data
public class ApprovalDto {
    private String id;          // RS0000000001
    private String name;        // 식당 이름
    private String mainImgUrl;  // 제목 앞 작은 이미지 [main_img = 'Y']
    private String writerName;  // tb_user의 nickname
    private LocalDateTime createDate;
    private String reqType;     // 필터링 확인용 (Y)
}