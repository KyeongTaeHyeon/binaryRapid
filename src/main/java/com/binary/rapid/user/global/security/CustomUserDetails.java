package com.binary.rapid.user.global.security;

import com.binary.rapid.user.dto.UserDto;
import com.binary.rapid.user.dto.UserResponseDto;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserDetails implements UserDetails {

    private final UserResponseDto user;

    public CustomUserDetails(UserResponseDto user) {
        this.user = user;
    }

    // 권한 설정
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }


    @Override
    public String getPassword() {
        return user.getPassword(); // 로그인용일 때만 사용됨
    }

    @Override
    public String getUsername() {
        return user.getId(); // unique key
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    public String getId() {
        return user.getId();
    }

    public String getNickname() {
        return user.getNickName();
    }

    public UserResponseDto getUser() {
        return user;
    }
}