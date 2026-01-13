package com.binary.rapid.user.mapper;


import com.binary.rapid.user.dto.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserMapper {

    int insertUser(UserDto user);

    int duplicateUserId(String id);
    int duplicateUserEmail(String email); // 추가
    int duplicateUserNickName(String nickName); // 추가

    SelectUserResponseForJwtDto selectUserId(String id);
    
    List<myBoardDto> selectBoardsByUserId(int id);

    UserResponseDto updateMyInfo(UserResponseDto loggerUser);

    UserResponseDto selectUserToUserResponseDto(String email);
    
    SelectUserResponseForJwtDto selectUserById(int userId);

    // 찜 목록 조회
    List<WishlistResponseDto> selectWishlistByUserId(int userId);
    // 찜 삭제 (취소)
    int deleteWishlist(@Param("userId") int userId, @Param("shopId") String shopId);

    List<UserMyReqShopDto> selectBoardListByUserId(@Param("params") Map<String, Object> params);

    int deleteUserByPk(Map<String, Object> params);

    List<UserMyReqShopDto> selectMyBoardList(Map<String, Object> params);
}
