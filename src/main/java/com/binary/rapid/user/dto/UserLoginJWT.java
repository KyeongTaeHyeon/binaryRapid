package com.binary.rapid.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginJWT {
    private String token;
    private SelectUserResponseForJwtDto user;
}
