package com.binary.rapid.user.constant;

import lombok.Getter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Getter
public enum TokenExpiration {
    ACCESS_TOKEN(1000 * 60 * 60), // 1시간
    REFRESH_TOKEN(1000L * 60 * 60 * 24 * 7); // 7일

    private final long milliseconds;

    TokenExpiration(long milliseconds) {
        this.milliseconds = milliseconds;
    }

    public LocalDateTime toLocalDateTime() {
        return LocalDateTime.now().plus(this.milliseconds, ChronoUnit.MILLIS);
    }
}