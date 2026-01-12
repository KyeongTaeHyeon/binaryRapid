package com.binary.rapid.approval.mapper;

import com.binary.rapid.approval.dto.ApprovalDto;
import com.binary.rapid.approval.dto.ApprovalDetailDto;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ApprovalMapper {
    List<ApprovalDto> selectApprovalList();
    ApprovalDetailDto selectApprovalInfo(String id);
    List<ApprovalDetailDto.ShopImageDto> selectApprovalImages(String id);
    List<String> selectApprovalCategories(String id);

    // 삭제 관련 메서드
    void deleteShopDetail(String id);
    void deleteShopImg(String id);
    void deleteShop(String id);
}