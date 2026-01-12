package com.binary.rapid.user.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;

@Mapper
public interface RefreshTokenMapper {
    // 토큰 저장 또는 업데이트 (ON DUPLICATE KEY UPDATE 활용)
    void saveRefreshToken(@Param("userId") int userId,
                          @Param("token") String token,
                          @Param("expiryDate") LocalDateTime expiryDate);

    // 토큰 조회
    String findTokenByUserId(int userId);

    // 로그아웃 시 해당 유저의 리프레시 토큰을 삭제합니다.
    void deleteTokenByUserId(@Param("userId") int userId);
}