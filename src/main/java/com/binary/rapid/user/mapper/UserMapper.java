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

    // 수정: UPDATE 쿼리는 int를 반환해야 함
    int updateMyInfo(UserResponseDto loggerUser);

    UserResponseDto selectUserToUserResponseDto(String email);
    
    SelectUserResponseForJwtDto selectUserById(int userId);

    // 찜 목록 조회
    List<WishlistResponseDto> selectWishlistByUserId(int userId);
    // 찜 삭제 (취소)
    int deleteWishlist(@Param("userId") int userId, @Param("shopId") String shopId);

    List<UserMyReqShopDto> selectBoardListByUserId(@Param("params") Map<String, Object> params);

    int deleteUserByPk(Map<String, Object> params);

    List<UserMyReqShopDto> selectMyBoardList(Map<String, Object> params);

    // 식당 신청 내역 권한 및 상태 확인
    int countRequestedShop(@Param("userId") int userId, @Param("shopId") String shopId);

    // 식당 신청 내역 삭제 (tb_shop - Hard Delete)
    int deleteRequestedShop(@Param("shopId") String shopId);

    // 식당 상세 정보 삭제 (tb_shopdetail - Physical Delete)
    int deleteRequestedShopDetail(@Param("shopId") String shopId);

    // 식당 이미지 삭제 (tb_shopimg - Physical Delete)
    int deleteRequestedShopImg(@Param("shopId") String shopId);
}
