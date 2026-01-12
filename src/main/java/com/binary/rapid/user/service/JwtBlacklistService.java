package com.binary.rapid.user.service;

import com.binary.rapid.user.mapper.BlacklistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class JwtBlacklistService {
    
    private final BlacklistMapper blacklistMapper; // 새로 만들어야 함

    // 블랙리스트 등록
    public void blacklistToken(String token, long remainingTime) {
        LocalDateTime expiryDate = LocalDateTime.now().plus(remainingTime, ChronoUnit.MILLIS);
        blacklistMapper.insertBlacklist(token, expiryDate);
    }

    // 블랙리스트 여부 확인 (필터용)
    public boolean isBlacklisted(String token) {
        return blacklistMapper.existsByToken(token) > 0;
    }
}