package com.binary.rapid.user.constant;

import lombok.Getter;

@Getter
// 유저 권한 타입
public enum UserRole {
    
    USER("일반 사용자"),
    ADMIN("관리자");
    
    
    private final String description;

    UserRole(String description) {
        this.description = description;
    }
}
