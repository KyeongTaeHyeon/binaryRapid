package com.binary.rapid.admin.controller;

import com.binary.rapid.admin.dto.AdminDto;
import com.binary.rapid.admin.dto.AdminSearchCondition; // 위에서 만든 DTO
import com.binary.rapid.admin.dto.CategoryDto;
import com.binary.rapid.admin.dto.NoticeDto;
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

    // 1. 공지사항 리스트 페이지 (검색 기능 포함)
    @GetMapping("/notices")
    public String noticeList(
            Model model,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword
    ) {
        // 1. 서비스 호출
        List<NoticeDto> noticeList = adminService.getNoticeList(type, keyword);

        // 2. 화면에 데이터 전달
        model.addAttribute("notices", noticeList);

        // 3. 검색 조건 유지 (HTML 검색창에 값 남기기 위해)
        model.addAttribute("searchType", type);
        model.addAttribute("searchKeyword", keyword);

        return "admin/noticeList"; // templates/admin/noticeList.html
    }

    /**
     * 공지사항 등록 처리 (모달 Form Submit)
     */
    @PostMapping("/notices/add")
    public String addNotice(NoticeDto noticeDto) {

        // [TODO] 로그인한 관리자 정보 세팅 (Spring Security 사용 시 변경 필요)
        // 현재는 임시 데이터
        noticeDto.setAdminId(11);
        noticeDto.setId("admin");
        noticeDto.setNickName("관리자");

        // DB 저장
        adminService.addNotice(noticeDto);

        // 저장 후 목록 페이지로 리다이렉트
        return "redirect:/admin/notices";
    }

    @PostMapping("/notices/update") // 경로 주의: /admin이 클래스 위에 있으므로 /notices/update가 맞음
    public String updateNotice(NoticeDto params) {

        // [수정] 대문자 AdminService -> 소문자 adminService (의존성 주입된 빈 사용)
        adminService.updateNotice(params);

        return "redirect:/admin/notices";
    }
    
    /*
    Category 
    */
    // --- 카테고리 컨트롤러 ---

    // 1. 페이지 로딩 (좌측 그룹 리스트만 전달)
    @GetMapping("/categories")
    public String categoryList(Model model,
                               @RequestParam(required = false) String groupId) { // [추가] 리다이렉트된 그룹ID 받기

        model.addAttribute("groupList", adminService.getCategoryGroupList());

        // [추가] 저장 후 돌아왔을 때, 이 값을 화면에 전달해서 JS가 자동 클릭하게 함
        model.addAttribute("targetGroupId", groupId);

        return "admin/categoryList";
    }

    // 2. [AJAX] 우측 상세 리스트 조회
    @GetMapping("/categories/items")
    @ResponseBody
    public List<CategoryDto> getCategoryItems(@RequestParam String groupId) {
        return adminService.getCategoryListByGroup(groupId);
    }

    // 3. [AJAX] Prefix 중복 체크
    @GetMapping("/categories/check-prefix")
    @ResponseBody
    public ResponseEntity<Boolean> checkPrefix(@RequestParam String prefix) {
        return ResponseEntity.ok(adminService.checkPrefixAvailable(prefix));
    }

    // 4. 저장 (생성, 추가, 수정)
    @PostMapping("/categories/save")
    public String saveCategory(CategoryDto dto,
                               @RequestParam(required = false) String prefix,
                               @RequestParam(required = false, defaultValue = "false") boolean isNewGroup) {

        adminService.saveCategory(dto, prefix, isNewGroup);

        return "redirect:/admin/categories?groupId=" + dto.getGroupId();
    }

    // 5. 삭제
    @PostMapping("/categories/delete")
    public String deleteCategory(@RequestParam String id, @RequestParam String groupId) {
        adminService.deleteCategory(id);

        // [중요] 삭제 후에도 마찬가지입니다.
        return "redirect:/admin/categories?groupId=" + groupId;
    }
}
