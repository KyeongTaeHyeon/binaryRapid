package com.binary.rapid.user.global.security;

import com.binary.rapid.user.dto.UserResponseDto;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Getter
public class CustomUserDetails implements UserDetails, OAuth2User {

    private final UserResponseDto user;
    private Map<String, Object> attributes;

    // 일반 로그인용 생성자
    public CustomUserDetails(UserResponseDto user) {
        this.user = user;
    }

    // 소셜 로그인용 생성자
    public CustomUserDetails(UserResponseDto user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    /**
     * OAuth2User 인터페이스의 핵심 메서드
     * 이 메서드가 반환하는 값이 "Principal Name"이 됩니다.
     * 절대 null이나 빈 문자열을 반환하면 안 됩니다.
     */
// CustomUserDetails 클래스 안에 추가
    @Override
    public Map<String, Object> getAttributes() {
        return this.attributes;
    }

    @Override
    public String getName() {
        // attributes에서 직접 꺼내는 것이 가장 안전합니다.
        if (this.attributes != null && this.attributes.containsKey("sub")) {
            return String.valueOf(this.attributes.get("sub"));
        }
        return user.getEmail(); // sub가 정 없다면 email이라도 반환
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority(user.getRole().name()));
    }

    @Override
    public String getPassword() { return user.getPassword(); }

    @Override
    public String getUsername() { return user.getId(); }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    public String getId() {
        return user.getId();
    }

    public String getNickname() {
        return user.getNickName();
    }

    public UserResponseDto getUser() {
        return user;
    }

    public String getEmail() {
        return user.getEmail();
    }

    public int getUserId() {
        return user.getUserId();
    }
}