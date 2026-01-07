package com.binary.rapid.user.service;

import com.binary.rapid.user.dto.UserDto;
import com.binary.rapid.user.dto.UserLoginDto;
import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.factory.RandomPass;
import com.binary.rapid.user.factory.UserCreateFactory;
import com.binary.rapid.user.form.UserLoginForm;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.handler.DuplicateEmailException;
import com.binary.rapid.user.handler.InvalidPasswordException;
import com.binary.rapid.user.handler.UserNotFoundException;
import com.binary.rapid.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Select;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;


    // 로컬 회원가입을 위한 메서드
    @Transactional
    public int localSignup(UserSignUpForm form) {

        int dupleUser = userMapper.duplicateUserId(form.getId());

   /*   
        둘다 찍히고 결과는 가입시 요청한 아이디와 동일한 값이 있을시 1이 나옴
        System.out.println("듀플 아이디 정보 프린트: " + dupleUser);
        log.info("듀플 아이디 정보 로그: "+String.valueOf(dupleUser));*/

        if (dupleUser > 0) {
            throw new DuplicateEmailException();
        }

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

        int userSignUpOk = userMapper.insertUser(user);

        // 1이면 insert 성공
        log.info("인서트 결과값: " + userSignUpOk);

        // 4. insert 실패 방어
        if (userSignUpOk != 1) {
            throw new RuntimeException("회원가입 실패");
        }

        return userSignUpOk;

    }

    public UserResponseDto userLocalsignin(UserLoginForm form) {

        UserResponseDto selectUser = userMapper.selectUserId(form.getId());

        log.info("로컬 로그인시 select된 유저 정보 : " + selectUser.toString());

        if (selectUser == null) {
            throw new UserNotFoundException();
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(form.getPassword(), selectUser.getPassword())) {
            throw new InvalidPasswordException();
        }
        
        return selectUser;
    }

    @Transactional
    // 사이트에 필요한 정보를 포함한 소셜을 통한 회원가입 메서드
    public int socialSignup(UserSignUpForm form) {

        // 여기서 form의 id가 social email로 가야함
        int dupleUser = userMapper.duplicateUserId(form.getId());

        if (dupleUser > 0) {
            throw new DuplicateEmailException();
        }

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

        int userSignUpOk = userMapper.insertUser(user);

        // 1이면 insert 성공
        log.info("인서트 결과값: " + userSignUpOk);

        // 4. insert 실패 방어
        if (userSignUpOk != 1) {
            throw new RuntimeException("회원가입 실패");
        }

        return userSignUpOk;
    }
}
