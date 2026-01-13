package com.binary.rapid.approval.mapper;

import com.binary.rapid.approval.dto.ApprovalDto;
import com.binary.rapid.approval.dto.ApprovalDetailDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ApprovalMapper {

    // (기존)
    List<ApprovalDto> selectApprovalList();

    // ✅ (추가) 페이징 목록
    List<ApprovalDto> selectApprovalListPage(@Param("offset") int offset, @Param("size") int size);

    // ✅ (추가) 전체 건수
    int countApprovalList();

    // ✅ RS + SEQ(10자리) 규칙용: 현재 최대 SEQ 조회
    Integer selectMaxRsSeq();

    ApprovalDetailDto selectApprovalInfo(String id);

    Integer selectShopOwnerUserId(@Param("id") String id);

    void updateShop(
            @Param("id") String id,
            @Param("name") String name,
            @Param("address") String address,
            @Param("content") String content
    );

    Integer selectMaxImgSeq(@Param("id") String id);

    void deleteShopImgBySeq(
            @Param("id") String id,
            @Param("imgSeq") int imgSeq
    );

    void resetMainImg(@Param("id") String id);

    void setMainImg(
            @Param("id") String id,
            @Param("imgSeq") int imgSeq
    );

    Integer selectMainImgSeq(@Param("id") String id);

    Integer selectFirstImgSeq(@Param("id") String id);

    List<ApprovalDetailDto.ShopImageDto> selectApprovalImages(String id);

    List<String> selectApprovalCategories(String id);

    void insertShop(
            @Param("id") String id,
            @Param("name") String name,
            @Param("address") String address,
            @Param("content") String content,
            @Param("userId") int userId
    );

    void insertShopDetail(
            @Param("id") String id,
            @Param("contents") String contents,
            @Param("userId") int userId
    );

    void insertShopImg(
            @Param("id") String id,
            @Param("imgSeq") int imgSeq,
            @Param("imgUrl") String imgUrl,
            @Param("mainImg") String mainImg
    );

    void deleteShopDetail(String id);

    void deleteShopImg(String id);

    void deleteShop(String id);
}
