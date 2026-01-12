package com.binary.rapid.user;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.form.UserLoginForm;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
// user update Test
public class UserMyInfoUpdateTest {

    @Autowired
    private UserService service;


    @Test
    public void insertMemberTest() {

        // 임시로 로그인 세션 생성
        UserResponseDto loginUser = service.userLocalsignin(new UserLoginForm("test1", "a123!"));


        loginUser.setNickName("업데이트 테스트맨");
        loginUser.setTaste("시오");
        loginUser.setEmail("test2@naver.com");

        UserResponseDto result = service.updateMyInfo(loginUser);

        System.out.println("결과 데이터: " + result.toString());
        
        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1);

        System.out.println("결과 데이터: " + result.toString());
    }


}
