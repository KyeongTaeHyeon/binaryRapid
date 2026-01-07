package com.binary.rapid.shop.mapper;

import com.binary.rapid.shop.form.ShopForm;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ShopMapper {
    List<ShopForm> allShopList(Map map);

    int countShopList(Map<String, Object> map);
    
    ShopForm shopInfo(String shopId);
}
