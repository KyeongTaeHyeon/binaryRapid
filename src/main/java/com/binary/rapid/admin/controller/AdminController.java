package com.binary.rapid.admin.controller;

import com.binary.rapid.admin.dto.AdminDto;
import com.binary.rapid.admin.dto.AdminSearchCondition; // 위에서 만든 DTO
import com.binary.rapid.admin.service.AdminService;
import com.binary.rapid.category.form.CategoryForm;
import com.binary.rapid.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final CategoryService categoryService;

    @GetMapping("/users")
    public String userList(
            Model model,
            // [핵심] 검색 조건을 객체로 받음 + 화면으로 자동 전달("search" 라는 이름으로)
            @ModelAttribute("search") AdminSearchCondition search
    ) {
        // 1. DB 조회 (DTO에서 값 꺼내서 서비스로 전달)
        List<AdminDto> userList = adminService.selectUserList(
                search.getCategory(),
                search.getKeyword(),
                search.getStartDate(),
                search.getEndDate()
        );
        model.addAttribute("users", userList);

        // 2. 카테고리 필터용 데이터 (드롭다운 채우기)
        Map<String, List<CategoryForm>> categoryMap = categoryService.getCategoryFilterMap();
        model.addAttribute("tasteList", categoryMap.get("category"));

        return "admin/userList"; // templates/admin/userList.html
    }

    @PostMapping("/users/{userId}/status")
    @ResponseBody // HTML이 아니라 데이터(JSON/Text)만 반환
    public ResponseEntity<String> updateUserStatus(
            @PathVariable int userId,
            @RequestBody Map<String, String> body // 간단한 데이터라 Map으로 받음
    ) {
        String action = body.get("action");

        try {
            adminService.changeUserStatus(userId, action);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("fail");
        }
    }
}
