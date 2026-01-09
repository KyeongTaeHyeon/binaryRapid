package com.binary.rapid.user.dto;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    
    // 유저 고유값
    int userId;
    // 유저 로그인 아이디
    String id;
    // 유저가 사이트 내에서 사용할 별칭
    String nickName;
    String name;
    String password;
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

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }


}
