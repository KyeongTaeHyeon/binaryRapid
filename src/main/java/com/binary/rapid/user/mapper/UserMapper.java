package com.binary.rapid.user.mapper;

import com.binary.rapid.Board.dto.BoardDto;
import com.binary.rapid.user.dto.UserDto;
import com.binary.rapid.user.dto.UserResponseDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserMapper {
    
    int insertUser(UserDto user);

    int duplicateUserId(String id);
    
    UserResponseDto selectUserId(String id);

    List<BoardDto> selectBoardsByUserId(int id);
}
