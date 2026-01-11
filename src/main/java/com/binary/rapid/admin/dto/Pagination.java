package com.binary.rapid.admin.dto;

import lombok.Data;

@Data
public class Pagination {
    private int page;       // 현재 페이지
    private int size;       // 페이지당 게시물 수 (10개)
    private int totalCount; // 전체 게시물 수
    private int totalPage;  // 전체 페이지 수
    private int startPage;  // 네비게이션 시작 번호 (예: 1, 11, 21...)
    private int endPage;    // 네비게이션 끝 번호 (예: 10, 20, 30...)
    private boolean prev;   // 이전 버튼 활성화 여부
    private boolean next;   // 다음 버튼 활성화 여부
    private int offset;     // DB 조회용 OFFSET

    public Pagination(int page, int totalCount) {
        this.page = page;
        this.size = 10; // 1. 10개 단위 고정
        this.totalCount = totalCount;
        this.offset = (page - 1) * size;

        // 전체 페이지 수 계산
        this.totalPage = (int) Math.ceil((double) totalCount / size);

        // 네비게이션 블록 계산 (한 번에 10페이지씩 보여줌)
        int navSize = 10;
        this.endPage = (int) (Math.ceil((double) page / navSize)) * navSize;
        this.startPage = this.endPage - (navSize - 1);

        // 실제 끝 페이지가 계산된 endPage보다 작으면 교체
        if (this.endPage > this.totalPage) {
            this.endPage = this.totalPage;
        }

        // 이전/다음 버튼 활성화 여부
        this.prev = this.startPage > 1;
        this.next = this.endPage < this.totalPage;
    }
}
