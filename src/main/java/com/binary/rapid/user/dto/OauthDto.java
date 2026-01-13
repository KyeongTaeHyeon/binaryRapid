package com.binary.rapid.user.dto;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
import com.binary.rapid.user.factory.RandomPass;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.AuthProvider;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OauthDto {
    // 유저 고유 값
    int userId;
    // 유저 아이디 (로그인시)
    String id;
    String password;
    // 유저가 사이트 내에서 사용할 별칭
    String nickName;
    String name;
    // 라멘 취향
    String taste;
    String birth;
    String email;
    // 소셜로그인 여부 + 어떤 소셜로그인 인지
    SocialType social;
    String gender;
    // Admin 과 User 구분을 위한 변수
    UserRole role;
    LocalDateTime createDate;
    LocalDateTime updateDate;
    LocalDateTime deleteDate;

    private String provider;
    private String providerId;



    public static OauthDto createSocialUser(String email, String nickName, String provider, String providerId, String name, String taste, String gender, String birth) {
        OauthDto user = new OauthDto();

        user.id = "oauth2_dummy_id"+RandomPass.generate(10);
        user.email = email;
        user.nickName = nickName;  
        user.provider = provider;
        user.providerId = providerId;

        user.password = "oauth2_dummy_Pass"+RandomPass.generate(10);
        user.role = UserRole.USER;      
        
        user.createDate = LocalDateTime.now();

        return user;
    }

}