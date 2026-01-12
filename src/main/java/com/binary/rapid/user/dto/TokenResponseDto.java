package com.binary.rapid.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponseDto {
    private String accessToken;  // 기존 token에서 이름 변경 권장
    private String refreshToken; // 추가
    private long accessTokenExpiresIn; // 만료 시간 (ms)
    private long refreshTokenExpiresIn; // 만료 시간 (ms)
}
