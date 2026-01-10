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

    /*
    *   
        createToken(String email) → 로그인 성공 시 토큰 생성
        validateToken(String token) → 요청마다 토큰 검증
        getEmailFromToken(String token) → 사용자 식별 정보 추출
    * 
    */

    // secretKey
    @Value("${jwt.secret}")
    private String secretKey;

/*    
    // accessToken
    @Value("${jwt.access-token-expire-time}")
    private long accessTokenExpireTime;

    // refreshToken
    @Value("${jwt.refresh-token-expire-time}")
    private long refreshTokenExpireTime;
    */

    // test용
    private static final long EXPIRATION_MS = 1000 * 60 * 60 * 24; // 1일

    private static Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // JWT 생성
    public static String createToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // JWT 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // JWT에서 이메일 추출
    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
