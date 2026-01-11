package com.binary.rapid.user.global.jwt;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secretKey;

    // 만료 시간 설정
    private static final long ACCESS_TIME = 1000 * 60 * 60; // 1시간
    private static final long REFRESH_TIME = 1000L * 60 * 60 * 24 * 7; // 7일

    private static Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Access Token 생성 (이메일 기반)
    public static String createAccessToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh Token 생성 (별도 클레임 없이 랜덤성 보장)
    public static String createRefreshToken() {
        return Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | io.jsonwebtoken.MalformedJwtException e) {
            // 잘못된 서명 또는 잘못된 형식의 토큰
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // 만료된 토큰
        } catch (io.jsonwebtoken.UnsupportedJwtException e) {
            // 지원되지 않는 토큰
        } catch (IllegalArgumentException e) {
            // 토큰이 비어있음
        }
        return false;
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public long getRemainingExpiration(String token) {
        try {
            Date expiration = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();

            return expiration.getTime() - System.currentTimeMillis();
        } catch (Exception e) {
            return 0;
        }
    }
}

