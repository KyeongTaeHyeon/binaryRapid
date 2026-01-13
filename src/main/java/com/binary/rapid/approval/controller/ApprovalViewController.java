package com.binary.rapid.approval.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/approval")
public class ApprovalViewController {

    @GetMapping("")
    public String approvalListPage() {
        return "approval/approvalList"; // templates/approval/approvalList.html
    }

    @GetMapping("/detail")
    public String approvalDetailPage() {
        return "approval/approvalDetail"; // templates/approval/approvalDetail.html
    }

    @GetMapping("/write")
    public String approvalWritePage() {
        return "approval/approvalWrite";
    }

    // ✅ 수정 화면 진입: write 화면을 그대로 재사용 (query param id로 수정/등록 구분)
    @GetMapping("/edit")
    public String approvalEditPage() {
        return "approval/approvalWrite";
    }
}
