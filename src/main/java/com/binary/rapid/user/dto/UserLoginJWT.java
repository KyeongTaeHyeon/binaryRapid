package com.binary.rapid.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginJWT {
    private String accessToken;  // 기존 token에서 이름 변경 권장
    private String refreshToken; // 추가
    private SelectUserResponseForJwtDto user;
}