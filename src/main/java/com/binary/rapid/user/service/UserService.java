package com.binary.rapid.user.service;

import com.binary.rapid.user.dto.UserDto;
import com.binary.rapid.user.factory.RandomPass;
import com.binary.rapid.user.factory.UserCreateFactory;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.handler.DuplicateEmailException;
import com.binary.rapid.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;


    // 로컬 회원가입을 위한 메서드
    public int localSignup(UserSignUpForm form) {

        int dupleUser = userMapper.duplicateUserId(form.getId());

        if (dupleUser == 1) {

            throw new DuplicateEmailException();

        } else {

            UserDto user = UserCreateFactory.createLocalUser(
                    form.getId(),
                    passwordEncoder.encode(form.getPassword()),
                    form.getNickName(),
                    form.getName(),
                    form.getTaste(),
                    form.getBirth(),
                    form.getEmail(),
                    form.getGender()
            );

            int result = userMapper.insertUser(user);
            return 1;
        }
    }

    // 사이트에 필요한 정보를 포함한 소셜을 통한 회원가입 메서드
    public void socialSignup(UserSignUpForm form) {

        int dupleUser = userMapper.duplicateUserId(form.getId());


        if (dupleUser == 1) {
            throw new DuplicateEmailException();
        }


        UserDto user = UserCreateFactory.CreateOauthUser(

                form.getId(),
                passwordEncoder.encode(RandomPass.generate(13)),
                form.getNickName(),
                form.getTaste(),
                form.getBirth(),
                form.getName(),
                form.getEmail(),
                form.getGender()
        );

        userMapper.insertUser(user);
    }


}
