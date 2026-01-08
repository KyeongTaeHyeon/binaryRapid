package com.binary.rapid.shop.controller;

import com.binary.rapid.category.form.CategoryForm;
import com.binary.rapid.category.service.CategoryService;
import com.binary.rapid.shop.form.ShopForm;
import com.binary.rapid.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpServletRequest;

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
    @ResponseBody // [핵심] 뷰(HTML)를 찾지 않고 데이터를 그대로 반환
    public Map<String, Object> filterShopList(HttpServletRequest request,
                                              @PageableDefault(size = 8) Pageable pageable) {

        // 1. 파라미터 가공 (기존 로직 유지)
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

        // 2. 서비스 호출 (DB 조회)
        Page<ShopForm> shopPage = shopService.allShopList(searchMap, pageable);

        // 3. JSON 응답 구조 만들기 (필요한 정보만 골라서 담기)
        Map<String, Object> response = new HashMap<>();
        response.put("content", shopPage.getContent());          // 실제 가게 리스트 데이터
        response.put("totalPages", shopPage.getTotalPages());    // 전체 페이지 수
        response.put("number", shopPage.getNumber());            // 현재 페이지 번호 (0부터 시작)
        response.put("first", shopPage.isFirst());               // 첫 페이지 여부
        response.put("last", shopPage.isLast());                 // 마지막 페이지 여부

        log.info("데이터 요청 응답 - 페이지: {}, 개수: {}", shopPage.getNumber(), shopPage.getContent().size());

        return response; // 자동으로 JSON으로 변환되어 브라우저로 전송됨
    }

    /**
     * [2] 초기 페이지 로드 (화면 껍데기 + 초기 데이터)
     * - /shop 으로 접속했을 때 실행됩니다.
     * - 기본 화면(헤더, 푸터, 필터 목록)을 그려서 보냅니다.
     */
    @GetMapping()
    public String shopList(@RequestParam(value = "ramenId", required = false) String ramenId,
                           Model model, @PageableDefault(size = 8) Pageable pageable) {

        // 1. 초기 데이터 조회 (첫 화면도 데이터가 있어야 하니까요)
        Map<String, Object> searchMap = new HashMap<>();
        searchMap.put("conditions", new HashMap<>());

        if (ramenId != null) {
            searchMap.put("category", ramenId.replace("RM", "G"));
        }

        Page<ShopForm> shopList = shopService.allShopList(searchMap, pageable);
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
     * [3] 상세 페이지
     */
    @GetMapping("/{id}")
    public String shopDetailList(@PathVariable("id") String shopId, Model model) {
        ShopForm shopInfo = shopService.shopInfo(shopId);
        model.addAttribute("shopInfo", shopInfo);
        return "shop/shopDetail";
    }
}
