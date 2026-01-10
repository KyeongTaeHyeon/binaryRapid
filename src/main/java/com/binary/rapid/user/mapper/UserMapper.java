package com.binary.rapid.user.mapper;

import com.binary.rapid.Board.dto.BoardDto;
import com.binary.rapid.user.dto.SelectUserResponseForJwtDto;
import com.binary.rapid.user.dto.UserDto;
import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.dto.myBoardDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserMapper {
    
    int insertUser(UserDto user);

    int duplicateUserId(String id);

    SelectUserResponseForJwtDto selectUserId(String id);

    List<myBoardDto> selectBoardsByUserId(int id);

    UserResponseDto updateMyInfo(UserResponseDto loggerUser);

    UserResponseDto selectUserToUserResponseDto(String email);
}
