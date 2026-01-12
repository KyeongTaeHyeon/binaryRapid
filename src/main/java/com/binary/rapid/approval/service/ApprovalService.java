package com.binary.rapid.approval.service;

import com.binary.rapid.approval.dto.ApprovalDto;
import com.binary.rapid.approval.dto.ApprovalDetailDto;
import com.binary.rapid.approval.mapper.ApprovalMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalMapper approvalMapper;

    /** 1. 목록 조회 */
    @Transactional(readOnly = true)
    public List<ApprovalDto> findAll() {
        return approvalMapper.selectApprovalList();
    }

    /** 2. 상세 정보 조회 (기본정보 + 카테고리 + 이미지 리스트) */
    @Transactional(readOnly = true)
    public ApprovalDetailDto getApprovalDetail(String id) {
        ApprovalDetailDto dto = approvalMapper.selectApprovalInfo(id);
        if (dto != null) {
            dto.setCategories(approvalMapper.selectApprovalCategories(id));
            dto.setImages(approvalMapper.selectApprovalImages(id));
        }
        return dto;
    }

    /** 3. 삭제 로직 (컨트롤러 에러 해결 지점) */
    @Transactional
    public void deleteApproval(String id) {
        // 자식 데이터부터 순서대로 삭제 (사용자님 기존 로직 유지)
        approvalMapper.deleteShopDetail(id);
        approvalMapper.deleteShopImg(id);
        approvalMapper.deleteShop(id);
    }
}