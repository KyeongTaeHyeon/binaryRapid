package com.binary.rapid.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShopDto {
    private String id;
    private String name;
    private String address;
    private String content;
    private String region;
    private String reqType;
    private String reqUserId;
    private String userId;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private LocalDateTime deleteDate;
}
