package com.binary.rapid.user.form;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
import com.binary.rapid.user.dto.UserDto;
import lombok.Data;
import org.apache.logging.log4j.core.config.plugins.validation.constraints.NotBlank;


@Data
// 회원가입시 사용할 객체 (Local과 Oauth 생성 메서드 따로 구분하여 사용)
public class UserSignUpForm {

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




}
