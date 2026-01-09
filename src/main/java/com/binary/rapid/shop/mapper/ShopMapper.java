package com.binary.rapid.shop.mapper;

import com.binary.rapid.shop.form.ShopForm;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ShopMapper {
    List<ShopForm> allShopList(Map<String, Object> map);

    int countShopList(Map<String, Object> map);

    ShopForm shopInfo(Map<String, Object> params);

    int existsWishlist(@Param("userId") int userId, @Param("shopId") String shopId);

    void insertWishlist(@Param("userId") int userId, @Param("shopId") String shopId);

    int deleteWishlist(@Param("userId") int userId, @Param("shopId") String shopId);
}
