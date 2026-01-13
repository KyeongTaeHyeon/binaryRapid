package com.binary.rapid.user.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponseDto {
    private int userId;
    private String shopId;
    private String createDate; // 찜한 날짜

    // 상점 상세 정보 (ShopForm 필드와 매핑)
    private String shopName;
    private String shopAddress;
    private String shopContent;
    private String imgUrl;
    private String siteUrl;
}