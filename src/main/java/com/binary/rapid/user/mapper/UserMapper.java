package com.binary.rapid.user.mapper;

import com.binary.rapid.user.dto.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {

    int insertUser(UserDto user);

    int duplicateUserId(String id);

    SelectUserResponseForJwtDto selectUserId(String id);
    
    List<myBoardDto> selectBoardsByUserId(int id);

    UserResponseDto updateMyInfo(UserResponseDto loggerUser);

    UserResponseDto selectUserToUserResponseDto(String email);
    
    SelectUserResponseForJwtDto selectUserById(int userId);

    // 찜 목록 조회
    List<WishlistResponseDto> selectWishlistByUserId(int userId);
    // 찜 삭제 (취소)
    int deleteWishlist(@Param("userId") int userId, @Param("shopId") String shopId);
    
}
