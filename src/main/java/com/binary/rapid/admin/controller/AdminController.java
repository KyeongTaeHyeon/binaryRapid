package com.binary.rapid.admin.controller;

import com.binary.rapid.admin.dto.AdminDto;
import com.binary.rapid.admin.service.AdminService;
import com.binary.rapid.category.form.CategoryForm;
import com.binary.rapid.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@Controller // [중요] RestController 아님! 화면을 리턴함
@RequiredArgsConstructor
@RequestMapping("/admin") // 주소: /admin/users
public class AdminController {

    private final AdminService adminService;
    private final CategoryService categoryService;

    @GetMapping("/users")
    public String userList(
            Model model, // 데이터를 담을 상자
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        // 1. DB에서 조건에 맞는 리스트 가져오기
        List<AdminDto> userList = adminService.selectUserList(category, keyword, startDate, endDate);

        // 2. 화면(HTML)으로 데이터 보내기
        model.addAttribute("users", userList);

        // 3. 검색 조건(카테고리 목록) 보내기
        Map<String, List<CategoryForm>> categoryMap = categoryService.getCategoryFilterMap();
        model.addAttribute("tasteList", categoryMap.get("category"));

        // 4. 검색창에 입력했던 값 유지하기 (화면 새로고침 되어도 남아있게)
        model.addAttribute("paramCate", category);
        model.addAttribute("paramKeyword", keyword);
        model.addAttribute("paramStart", startDate);
        model.addAttribute("paramEnd", endDate);

        return "admin/userList"; // templates/admin/userList.html 열기
    }
}
