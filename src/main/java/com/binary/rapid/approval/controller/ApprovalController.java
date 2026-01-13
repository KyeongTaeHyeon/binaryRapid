package com.binary.rapid.approval.controller;

import com.binary.rapid.approval.dto.ApprovalDto; // 추가
import com.binary.rapid.approval.dto.ApprovalDetailDto;
import com.binary.rapid.approval.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // 추가

@RestController
@RequestMapping("/approval")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    // 1. 리스트 페이지 (보안 우회를 위해 /login 붙임)
    @GetMapping("")
    public String approvalListPage() {
        return "approval/approvalList";
    }

    // ✅ 목록 조회 API 추가 (이게 없어서 404가 떴던 것입니다!)
    @GetMapping("/list")
    public ResponseEntity<List<ApprovalDto>> getApprovalList() {
        List<ApprovalDto> list = approvalService.findAll(); // Service의 findAll 호출
        return ResponseEntity.ok(list);
    }


    // 상세 조회 API (기존 유지)
    @GetMapping("/detail/{id}")
    public ResponseEntity<ApprovalDetailDto> getApprovalDetail(@PathVariable String id) {
        ApprovalDetailDto detail = approvalService.getApprovalDetail(id);
        if (detail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detail);
    }

    // 삭제 API (기존 유지)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteApproval(@PathVariable String id) {
        approvalService.deleteApproval(id);
        return ResponseEntity.ok().build();
    }
}
