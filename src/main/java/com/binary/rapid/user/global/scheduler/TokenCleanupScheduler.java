package com.binary.rapid.user.global.scheduler;

import com.binary.rapid.user.mapper.BlacklistMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final BlacklistMapper blacklistMapper;

    // 매일 새벽 3시에 실행 (cron = "초 분 시 일 월 요일")
    @Transactional
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupExpiredTokens() {
        log.info("만료된 블랙리스트 토큰 삭제 작업을 시작합니다.");
        blacklistMapper.deleteExpiredBlacklist();
        log.info("만료된 블랙리스트 토큰 삭제 작업이 완료되었습니다.");
    }
}