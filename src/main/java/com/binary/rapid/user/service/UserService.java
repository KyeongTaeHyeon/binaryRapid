package com.binary.rapid.user.service;

import com.binary.rapid.user.constant.SocialType;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtBlacklistService blacklistService;
    private final RefreshTokenMapper refreshTokenMapper;
    private final JwtUtil jwtUtil;


    // 로컬 회원가입 메서드 수정
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
                form.getGender(),
                form.getSocial() 
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
                form.getGender(),
                form.getSocial()
        );

        int userSignUpOk = userMapper.insertUser(user);
        
        // 3. insert 실패 방어
        if (userSignUpOk != 1) {
            throw new RuntimeException("회원가입 실패");
        }

        return userSignUpOk;
    }


    // 유저 id로 게시글 select
    public List<myBoardDto> getMyBoards(int loginUser) {

        if (loginUser == 0) {
            throw new LoginRequiredException();
        }

        return userMapper.selectBoardsByUserId(loginUser);
    }


    @Transactional
    public UserResponseDto updateMyInfo(UserResponseDto updateDto) {
        if (updateDto == null || updateDto.getUserId() == 0) {
            throw new IllegalArgumentException("수정할 유저 정보가 부족합니다.");
        }

        // 1. DB에서 현재 유저의 최신 정보 조회 (social 타입 확인을 위해)
        SelectUserResponseForJwtDto currentUser = userMapper.selectUserById(updateDto.getUserId());
        if (currentUser == null) throw new UserNotFoundException();

        // 2. [핵심] 로컬 유저일 때만 비밀번호 검증 진행
        // 소셜 유저(GOOGLE 등)는 비밀번호 검증 로직 자체를 건너뜁니다.
        if (currentUser.getSocial() == SocialType.LOCAL) {
            if (updateDto.getPassword() == null || updateDto.getPassword().isEmpty()) {
                throw new IllegalArgumentException("비밀번호를 입력해주세요.");
            }
            if (!passwordEncoder.matches(updateDto.getPassword(), currentUser.getPassword())) {
                throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
            }
        }

        // 3. 중복 체크 (본인 정보 제외)
        // 닉네임 변경 시 중복 체크
        if (updateDto.getNickName() != null && !updateDto.getNickName().equals(currentUser.getNickName())) {
            if (userMapper.duplicateUserNickName(updateDto.getNickName()) > 0) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
        }
        // 이메일 변경 시 중복 체크
        if (updateDto.getEmail() != null && !updateDto.getEmail().equals(currentUser.getEmail())) {
            if (userMapper.duplicateUserEmail(updateDto.getEmail()) > 0) {
                throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
            }
        }

        // 4. 데이터 유효성 검사 (Gender 길이 체크)
        if (updateDto.getGender() != null && updateDto.getGender().length() > 1) {
            // "Male" -> "M", "Female" -> "F" 등으로 변환하거나 에러 처리
            // 여기서는 첫 글자만 따오도록 처리 (안전장치)
            String safeGender = updateDto.getGender().substring(0, 1).toUpperCase();
            updateDto.setGender(safeGender);
        }

        // 5. 정보 업데이트 실행 (Mapper 호출)
        log.info("Updating user info for userId: {}", updateDto.getUserId());
        userMapper.updateMyInfo(updateDto);

        // 6. 업데이트된 결과 반환 (매핑 오류 방지를 위해 selectUserById 사용 후 변환)
        SelectUserResponseForJwtDto updatedUser = userMapper.selectUserById(updateDto.getUserId());
        
        return UserResponseDto.builder()
                .userId(updatedUser.getUserId())
                .id(updatedUser.getId())
                .nickName(updatedUser.getNickName())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .taste(updatedUser.getTaste())
                .birth(updatedUser.getBirth())
                .gender(updatedUser.getGender())
                .social(updatedUser.getSocial())
                .role(updatedUser.getRole())
                .createDate(updatedUser.getCreateDate())
                .updateDate(updatedUser.getUpdateDate())
                .build();
    }

    public String getEmailByUserId(int userId) {
        SelectUserResponseForJwtDto user = userMapper.selectUserById(userId);
        if (user == null) throw new UserNotFoundException();
        return user.getEmail();
    }

    // 통합 로그아웃 서비스
    @Transactional
    public void logout(int userId, String accessToken) {
        // 1. 리프레시 토큰 삭제
        if (userId > 0) {
            refreshTokenMapper.deleteTokenByUserId(userId);
        } else {
            // userId가 없을 경우에도 로그아웃 요청이라면(방어), 가능한 범위 내에서 로그아웃 처리 시도
            log.warn("logout called without valid userId; only attempting to delete refresh tokens if any mapping exists.");
        }

        // 2. 액세스 토큰 블랙리스트 등록
        if (accessToken != null && !accessToken.isEmpty()) {
            long remainingTime = jwtUtil.getRemainingExpiration(accessToken);
            if (remainingTime > 0) {
                blacklistService.blacklistToken(accessToken, remainingTime);
            }
        } else {
            log.info("No accessToken provided for blacklist registration during logout.");
        }
        log.info("유저 {} 로그아웃 처리 완료 (리프레시 삭제 + 블랙리스트 등록)", userId);
    }

    public List<WishlistResponseDto> getWishlistByUserId(int userId) {
        return userMapper.selectWishlistByUserId(userId);
    }

    public boolean removeWishlist(int userId, String shopId) {
        return userMapper.deleteWishlist(userId, shopId) > 0;
    }

    public List<UserMyReqShopDto> getBoardListByUserId(Map<String, Object> params) {
        // 1. 매퍼 호출
        List<UserMyReqShopDto> list = userMapper.selectBoardListByUserId(params);

        return list;
    }

    @Transactional
    public boolean deleteUser(int userId, String rawPassword) {
        // 1. 유저 정보 조회 (SelectUserResponseForJwtDto 등 사용)
        SelectUserResponseForJwtDto user = userMapper.selectUserById(userId);

        if (user == null) return false;

        // 2. 비밀번호 일치 확인
        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            // 3. 일치하면 탈퇴 처리 (delete_date = NOW())
            // 주의: 매퍼 XML의 deleteUserByPk가 userId와 password를 모두 필요로 한다면 
            // Map에 담아 보내거나, XML을 수정하여 userId만 조건으로 사용하세요.
            Map<String, Object> params = new HashMap<>();
            params.put("userId", userId);
            params.put("password", user.getPassword());

            return userMapper.deleteUserByPk(params) > 0;
        }

        return false; // 비밀번호 불일치
    }


    public boolean isIdDuplicate(String id) {
        // 결과가 0보다 크면 중복된 아이디가 존재한다는 뜻
        return userMapper.duplicateUserId(id) > 0;
    }

    public boolean isEmailDuplicate(String email) {
        return userMapper.duplicateUserEmail(email) > 0;
    }


    public boolean isNickNameDuplicate(String nickName) {
        return userMapper.duplicateUserNickName(nickName) > 0;
    }

    public List<UserMyReqShopDto> getMyBoardList(Map<String, Object> params) {
        return userMapper.selectMyBoardList(params);
    }

    // 식당 신청 내역 삭제 (Hard Delete)
    @Transactional
    public boolean deleteRequestedShop(int userId, String shopId) {
        // 1. 권한 및 상태 확인
        int count = userMapper.countRequestedShop(userId, shopId);
        if (count == 0) {
            return false; // 권한이 없거나 삭제 가능한 상태가 아님
        }

        // 2. 자식 데이터 삭제 (Physical Delete)
        userMapper.deleteRequestedShopDetail(shopId);
        userMapper.deleteRequestedShopImg(shopId);

        // 3. 부모 데이터 삭제 (Hard Delete)
        return userMapper.deleteRequestedShop(shopId) > 0;
    }
}
