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

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.*;

@Slf4j
@Controller
@RequestMapping("/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final CategoryService categoryService;

    /**
     * [1] 필터링 & 페이징 (AJAX 요청)
     * - 화면의 #contentWrapper 부분만 갱신할 때 사용
     */
    @GetMapping("/filter")
    public String filterShopList(Model model,
                                 HttpServletRequest request,
                                 @PageableDefault(size = 8) Pageable pageable) {
        System.out.println("filterShopList");
        // 1. 파라미터 가공 (Map<String, String[]> -> Map<String, Object>)
        // Service가 원하는 구조: Map 안에 "conditions"라는 키로 필터 맵이 들어있어야 함
        Map<String, Object> searchMap = new HashMap<>();
        Map<String, List<String>> conditions = new HashMap<>();

        Map<String, String[]> requestMap = request.getParameterMap();
        requestMap.forEach((key, values) -> {
            // "page", "size" 같은 페이징 파라미터는 검색 조건(conditions)에 넣지 않음
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

        log.info("필터 요청 - 페이지: {}, 조건: {}", pageable.getPageNumber(), conditions);

        // 2. 서비스 호출 (변경된 Service는 Map과 Pageable을 받음)
        // 반환 타입이 List가 아니라 Page<ShopForm> 입니다.
        Page<ShopForm> shopList = shopService.allShopList(searchMap, pageable);

        model.addAttribute("shopList", shopList);

        // 3. Thymeleaf 조각(fragment) 반환
        // 리스트와 페이징 버튼이 모두 포함된 #contentWrapper 영역을 교체
        return "shop/shop :: #contentWrapper";
    }

    /**
     * [2] 초기 전체 페이지 로드
     * - /shop 으로 접속했을 때 (헤더, 푸터, 사이드바 포함 전체 렌더링)
     */
    @GetMapping()
    public String shopList(@RequestParam(value = "ramenId", required = false) String ramenId,
                           Model model, @PageableDefault(size = 8) Pageable pageable) {

        Map<String, Object> searchMap = new HashMap<>();
        searchMap.put("conditions", new HashMap<>());

        if (ramenId != null) {
            searchMap.put("category", ramenId.replace("RM", "G"));
        }

        Page<ShopForm> shopList = shopService.allShopList(searchMap, pageable);
        model.addAttribute("shopList", shopList);

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

        // 검색 폼 초기화용 빈 객체
        model.addAttribute("searchForm", new HashMap<>());

        return "shop/shop";
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
