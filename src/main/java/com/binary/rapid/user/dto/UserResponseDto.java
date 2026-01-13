package com.binary.rapid.user.dto;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
// User 엔티티의 실제 패키지 경로를 임포트하세요. 
// 예: import com.binary.rapid.user.entity.User; 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {

    // 유저 고유값 (PK)
    private int userId;

    // 유저 로그인 아이디
    private String id;

    // 유저가 사이트 내에서 사용할 별칭
    private String nickName;
    private String name;

    // 보안을 위해 password 필드는 API 응답 시 제외하는 것이 좋지만, 
    // 필요하다면 남겨두되 from 메서드에서는 세팅하지 않습니다.
    private String password;

    // 라멘 취향
    private String taste;
    private String birth;
    private String email;

    // 소셜로그인 여부 + 어떤 소셜로그인 인지
    private SocialType social;
    private String gender;

    // Admin 과 User 구분을 위한 변수
    private UserRole role;
    

    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private LocalDateTime deleteDate;

 
}