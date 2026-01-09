package com.binary.rapid.admin.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class NoticeDto {
    private int noticeId;           // notice_id (PK, Auto Increment)
    private String noticeTitle;     // notice_title
    private String noticeContent;   // notice_content
    private int noticeType;         // notice_type (smallint -> int)

    // 작성자 정보
    private int adminId;            // admin_id
    private String id;              // id (관리자 로그인 ID)
    private String nickName;        // nickname

    // 날짜 관련 (DB타입이 date이므로 LocalDate 사용)
    private LocalDate noticeCreateAt; // notice_createAt
    private LocalDate noticeUpdateAt; // notice_updateAt

    private String noticeYN;          // notice_YN (varchar 2)

    // 화면 표시용 (유형 번호를 문자로 변환)
    // NoticeDto.java 내부

    public String getNoticeTypeLabel() {
        if (this.noticeType == 1) return "일반";
        if (this.noticeType == 2) return "이벤트";
        if (this.noticeType == 3) return "긴급";
        if (this.noticeType == 4) return "기타"; // 명시적으로 추가
        return ""; // 그 외 번호 공란 처리
    }
}
