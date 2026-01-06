package com.binary.rapid.user;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
// user insert Test
public class UserInsertTest {
    
    @Autowired
    private UserService service;


    
    @Test
    public void insertMemberTest() {

        UserSignUpForm member = new UserSignUpForm();
        member.setId("test2");
        member.setPassword("123444dd!");
        member.setNickName("테스트2");
        member.setName("김자바");
        member.setTaste("");
        member.setBirth("2026.01.06");
        member.setEmail("test2@naver.com");
        member.setSocial(SocialType.LOCAL);
        member.setGender("M");
        member.setRole(UserRole.USER);

        int result = service.localSignup(member);
        System.out.println(member);
        assertThat(result).isEqualTo(1);
    }

}
