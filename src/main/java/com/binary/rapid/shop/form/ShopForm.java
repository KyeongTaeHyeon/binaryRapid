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
    private String siteUrl;

    // 로그인 사용자의 찜 여부(없으면 false)
    private Boolean liked;

    private List<CategoryInfo> categories;

    public boolean isLiked() {
        return Boolean.TRUE.equals(liked);
    }

    @Data
    public static class CategoryInfo {
        private String categoryId;
        private String categoryName;
    }
}
