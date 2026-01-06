package com.binary.rapid.shop.form;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShopForm {
    private String shopId;
    private String shopName;
    private String shopAddress;
    private String shopContent;
    private String categoryId;
    private String categoryName;
    private String imgUrl;
}
