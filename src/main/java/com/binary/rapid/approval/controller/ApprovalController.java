package com.binary.rapid.approval.controller;

import com.binary.rapid.approval.dto.ApprovalDto;
import com.binary.rapid.approval.dto.ApprovalDetailDto;
import com.binary.rapid.approval.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.binary.rapid.user.global.security.CustomUserDetails;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approval")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    // ✅ 페이징 목록 조회
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getApprovalList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (page < 1) page = 1;
        if (size < 1) size = 10;

        int offset = (page - 1) * size;

        List<ApprovalDto> items = approvalService.findPage(offset, size);
        int totalCount = approvalService.countAll();
        int totalPages = (int) Math.ceil((double) totalCount / size);

        Map<String, Object> res = new HashMap<>();
        res.put("items", items);
        res.put("page", page);
        res.put("size", size);
        res.put("totalCount", totalCount);
        res.put("totalPages", totalPages);

        return ResponseEntity.ok(res);
    }

    // 상세 조회 API (기존 유지)
    @GetMapping("/detail/{id}")
    public ResponseEntity<ApprovalDetailDto> getApprovalDetail(@PathVariable String id) {
        ApprovalDetailDto detail = approvalService.getApprovalDetail(id);
        if (detail == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createApproval(
            @RequestParam String name,
            @RequestParam String address,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(value = "images", required = false) MultipartFile[] images, // ✅ 추가
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        if (principal == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "UNAUTHORIZED");
            return ResponseEntity.status(401).body(err);
        }

        String id = approvalService.createApproval(name, address, content, categories, images, principal);

        Map<String, Object> res = new HashMap<>();
        res.put("id", id);
        return ResponseEntity.ok(res);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateApproval(
            @PathVariable String id,
            @RequestParam String name,
            @RequestParam String address,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<Integer> deletedImgSeq,
            @RequestParam(required = false) Integer mainImgSeq,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        if (principal == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "UNAUTHORIZED");
            return ResponseEntity.status(401).body(err);
        }

        approvalService.updateApproval(id, name, address, content, categories, deletedImgSeq, images, mainImgSeq, principal);

        Map<String, Object> res = new HashMap<>();
        res.put("id", id);
        res.put("message", "OK");
        return ResponseEntity.ok(res);
    }


    // 삭제 API (기존 유지)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteApproval(@PathVariable String id) {
        approvalService.deleteApproval(id);
        return ResponseEntity.ok().build();
    }
}
