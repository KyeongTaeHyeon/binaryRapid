package com.binary.rapid.user.dto;

import com.binary.rapid.user.constant.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
// 관리자용 객체
public class AdminDto {

    // 유저 고유 값
    int userId;
    // 유저 아이디 (로그인시)
    String id;
    String password;
    // 유저가 사이트 내에서 사용할 별칭
    String nickName;
    // Admin 과 User 구분을 위한 변수
    UserRole role;
    LocalDateTime createDate;
    LocalDateTime updateDate;
    LocalDateTime deleteDate;
    
}
