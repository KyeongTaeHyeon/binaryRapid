package com.binary.rapid.category.service;

import com.binary.rapid.category.form.CategoryForm;
import com.binary.rapid.category.mapper.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryMapper categoryMapper;

    public Map<String, List<CategoryForm>> getCategoryFilterMap() {
        // 1. [수정] 사용자님 XML에 있는 ID인 'allCategory'를 호출합니다.
        List<CategoryForm> allList = categoryMapper.allCategory();

        // 2. [수정] XML 컬럼인 'groupId'를 기준으로 묶습니다.
        // (XML에서 group_id AS groupId 로 되어 있으므로 getGroupId() 사용)
        return allList.stream()
                .collect(Collectors.groupingBy(
                        CategoryForm::getGroupId, // 그룹핑 기준
                        LinkedHashMap::new,       // 순서 유지
                        Collectors.toList()
                ));
    }
}
