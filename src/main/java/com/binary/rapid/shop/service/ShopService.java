package com.binary.rapid.shop.service;

import com.binary.rapid.shop.form.ShopForm;
import com.binary.rapid.shop.mapper.ShopMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShopService {
    private final ShopMapper shopMapper;

    public List<ShopForm> allShopList(Map map) {
        return shopMapper.allShopList(map);
    }

    public ShopForm shopInfo(String shopId) {
        return shopMapper.shopInfo(shopId);
    }
    

}
