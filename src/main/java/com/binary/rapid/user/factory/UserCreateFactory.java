package com.binary.rapid.user.factory;

import com.binary.rapid.user.constant.SocialType;
import com.binary.rapid.user.constant.UserRole;
import com.binary.rapid.user.dto.UserDto;


public class UserCreateFactory {

    public static UserDto createLocalUser(String id, String encodedPassword, String nickname, String name, String taste, String birth, String email, String gender, SocialType social) {

        UserDto user = new UserDto();

        user.setId(id);
        user.setPassword(encodedPassword);
        user.setNickName(nickname);
        user.setName(name);
        user.setTaste(taste);
        user.setBirth(birth);
        user.setEmail(email);
        user.setSocial(social);
        user.setGender(gender);
        user.setRole(UserRole.USER);

        return user;
    }

    public static UserDto CreateOauthUser(String id, String nickname, String name, String taste, String birth, String email, String social, String gender) {

        UserDto user = new UserDto();

        user.setId(id);
        user.setNickName(nickname);
        user.setName(name);
        user.setTaste(taste);
        user.setBirth(birth);
        user.setEmail(email);
        user.setSocial(SocialType.GOOGLE);
        user.setGender(gender);
        user.setRole(UserRole.USER);

        return user;
    }
}
