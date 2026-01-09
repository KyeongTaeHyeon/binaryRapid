package com.binary.rapid.user;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
import com.binary.rapid.user.dto.UserResponseDto;
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

        UserResponseDto member = new UserResponseDto();
        member.setNickName("업데이트 테스트맨");
        member.setTaste("시오");
        member.setEmail("test2@naver.com");

        UserResponseDto result = service.updateMyInfo(member);

        System.out.println("결과 데이터: " + result.toString());
        // ✅ 핵심 검증
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test2@naver.com");

        // 콘솔에 출력해서 확인
        System.out.println("결과 데이터: " + result.toString());
    }


}
