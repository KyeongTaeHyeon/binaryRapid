package com.binary.rapid.user.service;

import com.binary.rapid.user.constant.UserRole;
import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.global.security.CustomUserDetails;
import com.binary.rapid.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserMapper mapper;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String sub = (String) attributes.get("sub"); // 고유 식별자

        UserResponseDto userDto = mapper.selectUserToUserResponseDto(email);

        if (userDto == null) {
            userDto = new UserResponseDto();
            userDto.setEmail(email);
            userDto.setName((String) attributes.get("name"));
            // [핵심] getUsername()이 빈 값을 반환하지 않도록 id를 임시로 채워줌
            userDto.setId(email);
            userDto.setRole(UserRole.USER);
        }

        // 두 번째 인자로 attributes를 반드시 넘겨야 CustomUserDetails.getName()이 작동합니다.
        return new CustomUserDetails(userDto, attributes);
    }
}