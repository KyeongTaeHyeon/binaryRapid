package com.binary.rapid.shop.controller;

import com.binary.rapid.shop.form.ShopForm;
import com.binary.rapid.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping()
    public String shopList(Model model) {
        List<ShopForm> shopList = shopService.allShopList(null);
        model.addAttribute("shopList", shopList);

        return "regionTheme/regionTheme";
    }
}
