package com.binary.rapid.user.dto;

import com.binary.rapid.user.constant.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
// 로그인시 사용할 객체
public class UserLoginDto {
    
    String id;
    String password;
    UserRole role;
    
    


}
