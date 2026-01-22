package com.binary.rapid.shop.controller;

import com.binary.rapid.category.form.CategoryForm;
import com.binary.rapid.category.service.CategoryService;
import com.binary.rapid.shop.form.ShopForm;
import com.binary.rapid.shop.service.ShopService;
import com.binary.rapid.user.dto.UserResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.*;

@Slf4j
@Controller
@RequestMapping("/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final CategoryService categoryService;

    /**
     * [1] 필터링 & 페이징 데이터 요청 (AJAX 전용 - CSR 방식)
     * - HTML이 아닌 순수 데이터(JSON)를 반환합니다.
     * - 자바스크립트가 이 주소(/shop/filter)를 호출해서 데이터를 받아갑니다.
     */
    @GetMapping("/filter")
    @ResponseBody
    public Map<String, Object> filterShopList(HttpServletRequest request,
                                              HttpSession session,
                                              @PageableDefault(size = 8) Pageable pageable) {

        Map<String, Object> searchMap = new HashMap<>();
        Map<String, List<String>> conditions = new HashMap<>();

        Map<String, String[]> requestMap = request.getParameterMap();
        requestMap.forEach((key, values) -> {
            if (!"page".equals(key) && !"size".equals(key) && !"sort".equals(key)) {
                List<String> validValues = new ArrayList<>();
                for (String val : values) {
                    if (val != null && !val.isEmpty() && !"all".equals(val)) {
                        validValues.add(val);
                    }
                }
                if (!validValues.isEmpty()) {
                    conditions.put(key, validValues);
                }
            }
        });
        searchMap.put("conditions", conditions);

        Integer userId = extractUserId(session);
        if (userId != null) {
            searchMap.put("userId", userId);
        }

        Page<ShopForm> shopPage = shopService.allShopList(searchMap, pageable, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("content", shopPage.getContent());
        response.put("totalPages", shopPage.getTotalPages());
        response.put("totalElements", shopPage.getTotalElements()); 
        response.put("number", shopPage.getNumber());
        response.put("first", shopPage.isFirst());
        response.put("last", shopPage.isLast());

        return response;
    }


    /**
     * [2] 초기 페이지 로드 (화면 껍데기 + 초기 데이터)
     * - /shop 으로 접속했을 때 실행됩니다.
     * - 기본 화면(헤더, 푸터, 필터 목록)을 그려서 보냅니다.
     */
    @GetMapping()
    public String shopList(@RequestParam(value = "ramenId", required = false) String ramenId,
                           Model model, HttpSession session, @PageableDefault(size = 8) Pageable pageable) {

        // 1. 초기 데이터 조회 
        Map<String, Object> searchMap = new HashMap<>();
        searchMap.put("conditions", new HashMap<>());

        Integer userId = extractUserId(session);
        if (userId != null) {
            searchMap.put("userId", userId);
        }

        if (ramenId != null) {
            searchMap.put("category", ramenId.replace("RM", "G"));
        }

        Page<ShopForm> shopList = shopService.allShopList(searchMap, pageable, userId);
        model.addAttribute("shopList", shopList); // Thymeleaf가 처음에 그릴 데이터

        // 2. 카테고리 필터 데이터 조회 (상단 필터 목록용)
        Map<String, List<CategoryForm>> categoryMap = categoryService.getCategoryFilterMap();
        Map<String, Map<String, List<CategoryForm>>> intermediate = new LinkedHashMap<>();

        if (categoryMap != null) {
            categoryMap.forEach((key, list) -> {
                if (list != null && !list.isEmpty()) {
                    String major = list.get(0).getMajor();
                    String minor = list.get(0).getMinor();
                    intermediate.computeIfAbsent(major, k -> new LinkedHashMap<>())
                            .put(minor, list);
                }
            });
        }

        List<Map<String, Object>> filterGroups = new ArrayList<>();
        intermediate.forEach((majorName, minorMap) -> {
            Map<String, Object> group = new HashMap<>();
            group.put("majorName", majorName);
            group.put("minorMap", minorMap);
            String firstMinorKey = minorMap.keySet().iterator().next();
            group.put("hideHeader", majorName.equals(firstMinorKey));
            filterGroups.add(group);
        });

        model.addAttribute("categoryMap", categoryMap);
        model.addAttribute("filterGroups", filterGroups);
        model.addAttribute("searchForm", new HashMap<>());

        return "shop/shop"; // shop.html 파일 열기
    }

    /**
     * [3] 상세 페이지 (HTML 렌더링)
     */
    @GetMapping("/{id}")
    public String shopDetailList(@PathVariable("id") String shopId, Model model, HttpSession session) {
        ShopForm shopInfo = shopService.shopInfo(shopId, extractUserId(session));
        model.addAttribute("shopInfo", shopInfo);
        return "shop/shopDetail";
    }

    /**
     * [4] 찜 토글
     */
    @PostMapping("/{id}/wishlist")
    @ResponseBody
    public ResponseEntity<?> toggleWishlist(@PathVariable("id") String shopId, HttpSession session) {
        UserResponseDto loginUser = (UserResponseDto) session.getAttribute("loginUser");
        if (loginUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("LOGIN_REQUIRED");
        }

        boolean liked = shopService.toggleWishlist(loginUser.getUserId(), shopId);
        Map<String, Object> body = new HashMap<>();
        body.put("liked", liked);
        return ResponseEntity.ok(body);
    }

    private Integer extractUserId(HttpSession session) {
        if (session == null) return null;
        Object loginUser = session.getAttribute("loginUser");
        if (loginUser instanceof UserResponseDto dto) {
            return dto.getUserId();
        }
        return null;
    }
}
