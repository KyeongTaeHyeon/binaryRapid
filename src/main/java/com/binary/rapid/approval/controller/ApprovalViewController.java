package com.binary.rapid.approval.controller;

import com.binary.rapid.user.global.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/approval")
public class ApprovalViewController {

    @GetMapping({"", "/"})
    public String approvalListPage() {
        return "approval/approvalList";
    }

    @GetMapping("/detail")
    public String approvalDetailPage() {
        return "approval/approvalDetail";
    }

    // ✅ 글쓰기 페이지: 로그인 필요
    @GetMapping("/write")
    public String approvalWritePage(
            @AuthenticationPrincipal CustomUserDetails principal,
            RedirectAttributes redirectAttributes
    ) {
        if (principal == null) {
            redirectAttributes.addFlashAttribute(
                    "loginMessage",
                    "로그인이 필요합니다."
            );
            return "redirect:/login";
        }
        return "approval/approvalWrite";
    }

    // ✅ 수정 페이지: 로그인 필요
    @GetMapping("/edit")
    public String approvalEditPage(
            @AuthenticationPrincipal CustomUserDetails principal,
            RedirectAttributes redirectAttributes
    ) {
        if (principal == null) {
            redirectAttributes.addFlashAttribute(
                    "loginMessage",
                    "로그인이 필요합니다."
            );
            return "redirect:/login";
        }
        return "approval/approvalWrite";
    }
}
