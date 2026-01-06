package com.binary.rapid.shop.controller;

import com.binary.rapid.category.form.CategoryForm;
import com.binary.rapid.category.service.CategoryService;
import com.binary.rapid.shop.form.ShopForm;
import com.binary.rapid.shop.service.ShopService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final CategoryService categoryService;

    @GetMapping()
    public String shopList(Model model) {
        Map map = new HashMap();
        List<ShopForm> shopList = shopService.allShopList(map);
        model.addAttribute("shopList", shopList);

        Map<String, Object> searchForm = new HashMap<>();
        searchForm.put("conditions", new HashMap<String, Object>());
        model.addAttribute("searchForm", searchForm);

        Map<String, List<CategoryForm>> categoryMap = categoryService.getCategoryFilterMap();

        Map<String, Map<String, List<CategoryForm>>> intermediate = new java.util.LinkedHashMap<>();
        if (categoryMap != null) {
            categoryMap.forEach((key, list) -> {
                if (list != null && !list.isEmpty()) {
                    String major = list.get(0).getMajor();
                    String minor = list.get(0).getMinor();
                    intermediate.computeIfAbsent(major, k -> new java.util.LinkedHashMap<>())
                            .put(minor, list);
                }
            });
        }

        List<Map<String, Object>> filterGroups = new java.util.ArrayList<>();
        intermediate.forEach((majorName, minorMap) -> {
            Map<String, Object> group = new java.util.HashMap<>();
            group.put("majorName", majorName);
            group.put("minorMap", minorMap);
            String firstMinorKey = minorMap.keySet().iterator().next();
            group.put("hideHeader", majorName.equals(firstMinorKey));
            filterGroups.add(group);
        });

        model.addAttribute("categoryMap", categoryMap);
        model.addAttribute("filterGroups", filterGroups);
        return "shop/shop";
    }

    // 상세조회보다 상단에 배치하여 "filter"라는 문자열이 ID로 인식되는 것을 방지
    @GetMapping("/filter")
    public String filterShopList(Model model, HttpServletRequest request) {
        // 1. request.getParameterMap()은 중복된 키(지역=R01&지역=R02)를 String[] 배열로 모두 가져옵니다.
        Map<String, String[]> parameterMap = request.getParameterMap();

        // MyBatis 매퍼에 전달할 최종 보따리
        Map<String, Object> searchForm = new HashMap<>();
        Map<String, List<String>> conditions = new HashMap<>();

        // 2. 모든 파라미터를 순회하며 리스트로 변환
        parameterMap.forEach((key, values) -> {
            List<String> idList = new ArrayList<>();
            for (String val : values) {
                // 'all' 값은 필터링에서 제외
                if (val != null && !val.isEmpty() && !"all".equals(val)) {
                    idList.add(val);
                }
            }

            // 유효한 ID가 하나라도 있는 그룹만 conditions에 추가
            if (!idList.isEmpty()) {
                conditions.put(key, idList);
            }
        });

        // 3. 매퍼 XML의 <if test="conditions != null"> 로직이 작동하도록 키 삽입
        searchForm.put("conditions", conditions);

        // 로그를 통해 [지역=[R01, R02, R03...]] 처럼 데이터가 다 들어왔는지 꼭 확인하세요
        log.info("MyBatis로 전달될 최종 데이터 구조: {}", searchForm);

        List<ShopForm> shopList = shopService.allShopList(searchForm);
        model.addAttribute("shopList", shopList);

        return "shop/shop :: #contentList";
    }

    @GetMapping(value = "/{id}")
    public String shopDetailList(@PathVariable("id") String shopId,
                                 Model model) {
        
        ShopForm shopInfo = shopService.shopInfo(shopId);
        model.addAttribute("shopInfo", shopInfo);

        return "shop/shopDetail";
    }


}
