package com.binary.rapid.shop.form;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShopForm {
    private String shopId;
    private String shopName;
    private String shopAddress;
    private String shopContent;
    private String imgUrl;

    private List<CategoryInfo> categories;

    @Data
    public static class CategoryInfo {
        private String categoryId;
        private String categoryName;
    }
}
