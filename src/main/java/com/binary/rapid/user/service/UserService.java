package com.binary.rapid.user.service;

import com.binary.rapid.user.dto.*;
import com.binary.rapid.user.factory.UserCreateFactory;
import com.binary.rapid.user.form.UserLoginForm;
import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.global.jwt.JwtUtil;
import com.binary.rapid.user.handler.DuplicateEmailException;
import com.binary.rapid.user.handler.InvalidPasswordException;
import com.binary.rapid.user.handler.LoginRequiredException;
import com.binary.rapid.user.handler.UserNotFoundException;
import com.binary.rapid.user.mapper.RefreshTokenMapper;
import com.binary.rapid.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtBlacklistService blacklistService;
    private final RefreshTokenMapper refreshTokenMapper;
    private final JwtUtil jwtUtil;


    // 로컬 회원가입
    @Transactional
    public int localSignup(UserSignUpForm form) {
        int dupleUser = userMapper.duplicateUserId(form.getId());
        if (dupleUser > 0) throw new DuplicateEmailException();

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
        if (result != 1) throw new RuntimeException("회원가입 실패");
        return result;
    }

    // 로컬 로그인 검증
    public SelectUserResponseForJwtDto userLocalsignin(UserLoginForm form) {
        SelectUserResponseForJwtDto selectUser = userMapper.selectUserId(form.getId());
        if (selectUser == null) throw new UserNotFoundException();

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


    // 유저 id로 게시글 select

    public List<myBoardDto> getMyBoards(int loginUser) {

        // ✅ Service는 세션을 직접 보지 않는다
        if (loginUser == 0) {
            throw new LoginRequiredException();
        }

        return userMapper.selectBoardsByUserId(loginUser);
    }


    @Transactional
    public UserResponseDto updateMyInfo(UserResponseDto updateDto) {

        if (updateDto == null || updateDto.getId() == null) {
            throw new IllegalArgumentException("수정할 유저 정보가 없습니다.");
        }

        // 1. DB에서 현재 유저 정보 가져오기 (비밀번호 비교를 위함)
        // SelectUserResponseForJwtDto 혹은 UserResponseDto를 상황에 맞게 사용하세요.
        SelectUserResponseForJwtDto currentUser = userMapper.selectUserById(updateDto.getUserId());

        if (currentUser == null) {
            throw new UserNotFoundException();
        }

        // 2. 비밀번호 검증 (사용자가 입력한 비번 vs DB에 저장된 암호화된 비번)
        if (!passwordEncoder.matches(updateDto.getPassword(), currentUser.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 정보 업데이트 실행
        userMapper.updateMyInfo(updateDto);

        // 4. 업데이트된 정보 다시 조회 (보통 이메일이나 PK로 조회)
        UserResponseDto updatedUser = userMapper.selectUserToUserResponseDto(updateDto.getEmail());

        return updatedUser;
    }

    public String getEmailByUserId(int userId) {
        SelectUserResponseForJwtDto user = userMapper.selectUserById(userId);
        if (user == null) throw new UserNotFoundException();
        return user.getEmail();
    }

    // ✅ 통합 로그아웃 서비스
    @Transactional
    public void logout(int userId, String accessToken) {
        // 1. 리프레시 토큰 삭제
        refreshTokenMapper.deleteTokenByUserId(userId);

        // 2. 액세스 토큰 블랙리스트 등록
        long remainingTime = jwtUtil.getRemainingExpiration(accessToken);
        if (remainingTime > 0) {
            blacklistService.blacklistToken(accessToken, remainingTime);
        }
        log.info("유저 {} 로그아웃 처리 완료 (리프레시 삭제 + 블랙리스트 등록)", userId);
    }

    public List<WishlistResponseDto> getWishlistByUserId(int userId) {
        return userMapper.selectWishlistByUserId(userId);
    }

    public boolean removeWishlist(int userId, String shopId) {
        return userMapper.deleteWishlist(userId, shopId) > 0;
    }

    public List<UserMyReqShopDto> getBoardListByUserId(int userId) {
        return userMapper.selectBoardListByUserId(userId);
    }
}
