package com.binary.rapid.user.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;

@Mapper
public interface BlacklistMapper {

    // 1. 블랙리스트 토큰 추가
    void insertBlacklist(@Param("token") String token,
                         @Param("expiryDate") LocalDateTime expiryDate);

    // 2. 해당 토큰이 블랙리스트에 있는지 확인 (있으면 1, 없으면 0 반환)
    int existsByToken(@Param("token") String token);

    // 
    void deleteExpiredBlacklist();
}