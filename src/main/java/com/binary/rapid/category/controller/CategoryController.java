package com.binary.rapid.category.controller;

import com.binary.rapid.category.form.CategoryForm;
import com.binary.rapid.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // JS에서 이 주소(/api/category/map)를 호출하면
    // 서비스가 groupId별로 예쁘게 분류해둔 데이터를 돌려줍니다.
    @GetMapping("/map")
    public ResponseEntity<Map<String, List<CategoryForm>>> getCategoryMap() {
        Map<String, List<CategoryForm>> categoryMap = categoryService.getCategoryFilterMap();
        return ResponseEntity.ok(categoryMap);
    }
}