package com.binary.rapid.user.mapper;

import com.binary.rapid.user.dto.UserDto;
import com.binary.rapid.user.entity.UserEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    
    int insertUser(UserDto user);

    int duplicateUserId(String id);
}
