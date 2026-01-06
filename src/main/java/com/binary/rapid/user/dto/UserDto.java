package com.binary.rapid.user.dto;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// 유저 전체 정보를 가진 객체 
public class UserDto {
    
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

}
