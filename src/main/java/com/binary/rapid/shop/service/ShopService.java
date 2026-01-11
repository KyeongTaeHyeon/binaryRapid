package com.binary.rapid.shop.service;

import com.binary.rapid.shop.form.ShopForm;
import com.binary.rapid.shop.mapper.ShopMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopMapper shopMapper;

    // 컨트롤러에서 이 메서드를 호출함
    public Page<ShopForm> allShopList(Map<String, Object> map, Pageable pageable, Integer userId) {

        // 1. 페이징 계산 (변수명 매칭 준비)
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();
        int offset = page * size;

        // 2. 맵에 XML이 기다리는 변수명("limit", "offset")을 넣어줌
        map.put("limit", size);
        map.put("offset", offset);
        if (userId != null) {
            map.put("userId", userId);
        }

        // 3. 카운트 조회 (Map 그대로 전달)
        int totalCount = shopMapper.countShopList(map);

        // 4. 리스트 조회 (Map 그대로 전달)
        List<ShopForm> content = Collections.emptyList();
        if (totalCount > 0) {
            content = shopMapper.allShopList(map);
        }

        // 5. 결과 반환
        return new PageImpl<>(content, pageable, totalCount);
    }

    public ShopForm shopInfo(String shopId, Integer userId) {
        return shopMapper.shopInfo(createParam(shopId, userId));
    }

    @Transactional
    public boolean toggleWishlist(int userId, String shopId) {
        int exists = shopMapper.existsWishlist(userId, shopId);
        if (exists > 0) {
            shopMapper.deleteWishlist(userId, shopId);
            return false;
        } else {
            shopMapper.insertWishlist(userId, shopId);
            return true;
        }
    }

    private Map<String, Object> createParam(String shopId, Integer userId) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("shopId", shopId);
        if (userId != null) map.put("userId", userId);
        return map;
    }
}
