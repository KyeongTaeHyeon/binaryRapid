package com.binary.rapid.shop.controller;

import com.binary.rapid.shop.form.ShopForm;
import com.binary.rapid.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping()
    public String shopList(Model model) {

        Map map = new HashMap();


        List<ShopForm> shopList = shopService.allShopList(map);
        model.addAttribute("shopList", shopList);

        return "regionTheme/regionTheme";
    }

    @GetMapping(value = "/detail/{id}")
    public String shopDetailList(@PathVariable("id") String shopId,
                                 Model model) {

        ShopForm shopInfo = shopService.shopInfo(shopId);
        model.addAttribute("shopInfo", shopInfo);
        return "regionTheme/regionTheme2";
    }
}
