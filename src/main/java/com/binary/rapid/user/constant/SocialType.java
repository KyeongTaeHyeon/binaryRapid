package com.binary.rapid.user.constant;

// 소셜 로그인 타입 
public enum SocialType {

    LOCAL("로컬"),
    GOOGLE("구글");


    private final String description;

    SocialType(String description) {
        this.description = description;
    }
}
