package com.binary.rapid.approval.service;

import com.binary.rapid.approval.dto.ApprovalDto;
import com.binary.rapid.approval.dto.ApprovalDetailDto;
import com.binary.rapid.approval.mapper.ApprovalMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.binary.rapid.user.global.security.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalMapper approvalMapper;

    @Value("${app.upload.root}")
    private String uploadRoot;

    // ✅ 작성자 여부 확인 (상세 화면에서 수정/삭제 버튼 노출용)
    @Transactional(readOnly = true)
    public boolean isOwner(String id, CustomUserDetails principal) {
        if (principal == null) return false;
        Integer ownerUserId = approvalMapper.selectShopOwnerUserId(id);
        if (ownerUserId == null) return false;
        return ownerUserId == principal.getUserId();
    }

    private void assertOwner(String shopId, CustomUserDetails principal) {
        if (principal == null) throw new IllegalStateException("UNAUTHORIZED");

        Integer ownerUserId = approvalMapper.selectShopOwnerUserId(shopId);
        if (ownerUserId == null) throw new IllegalStateException("NOT_FOUND");

        int me = principal.getUserId();
        if (ownerUserId != me) {
            throw new AccessDeniedException("FORBIDDEN");
        }
    }

    /**
     * (기존) 전체 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ApprovalDto> findAll() {
        return approvalMapper.selectApprovalList();
    }

    /**
     * ✅ (추가) 페이징 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ApprovalDto> findPage(int offset, int size) {
        return approvalMapper.selectApprovalListPage(offset, size);
    }

    /**
     * ✅ (추가) 전체 건수
     */
    @Transactional(readOnly = true)
    public int countAll() {
        return approvalMapper.countApprovalList();
    }

    /**
     * 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public ApprovalDetailDto getApprovalDetail(String id) {
        ApprovalDetailDto dto = approvalMapper.selectApprovalInfo(id);
        if (dto != null) {
            dto.setCategories(approvalMapper.selectApprovalCategories(id));
            dto.setImages(approvalMapper.selectApprovalImages(id));
        }
        return dto;
    }

    @Transactional
    public String createApproval(String name, String address, String content,
                                 List<String> categories,
                                 MultipartFile[] images,
                                 CustomUserDetails principal) {
        int userId = principal.getUserId();
        Integer maxSeq = approvalMapper.selectMaxRsSeq();
        int nextSeq = (maxSeq == null ? 0 : maxSeq) + 1;
        String id = "RS" + String.format("%010d", nextSeq);

        approvalMapper.insertShop(id, name, address, content, userId);

        if (categories != null) {
            for (String c : categories) {
                if (c == null) continue;
                String v = c.trim();
                if (v.isEmpty()) continue;
                approvalMapper.insertShopDetail(id, v, userId);
            }
        }

        if (images != null && images.length > 0) {
            saveShopImages(id, images);
        }

        return id;
    }

    private void saveShopImages(String shopId, MultipartFile[] images) {
        try {
            // ✅ WebConfig 설정과 일치하도록 app.upload.root 경로 사용
            Path dir = Paths.get(uploadRoot, "shopImg", shopId).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            int seq = 1;
            for (int i = 0; i < images.length; i++) {
                MultipartFile file = images[i];
                if (file == null || file.isEmpty()) continue;

                String original = file.getOriginalFilename();
                String safe = (original == null) ? "image" : original.replaceAll("[^a-zA-Z0-9._-]", "_");
                String fileName = System.currentTimeMillis() + "_" + i + "_" + safe;

                Path target = dir.resolve(fileName);
                file.transferTo(target);

                // ✅ DB에 저장될 URL (WebConfig의 /img/** 매핑과 일치)
                String imgUrl = "/img/shopImg/" + shopId + "/" + fileName;
                String mainImg = (seq == 1) ? "Y" : "N";

                approvalMapper.insertShopImg(shopId, seq, imgUrl, mainImg);
                seq++;
            }
        } catch (Exception e) {
            throw new IllegalStateException("이미지 저장 실패", e);
        }
    }

    @Transactional
    public void updateApproval(
            String id,
            String name,
            String address,
            String content,
            List<String> categories,
            List<Integer> deletedImgSeq,
            MultipartFile[] images,
            Integer mainImgSeq,
            com.binary.rapid.user.global.security.CustomUserDetails principal
    ) {
        if (principal == null) throw new IllegalStateException("UNAUTHORIZED");
        assertOwner(id, principal);

        approvalMapper.updateShop(id, name, address, content);

        approvalMapper.deleteShopDetail(id);
        int userId = principal.getUserId();
        if (categories != null) {
            for (String c : categories) {
                if (c == null) continue;
                String v = c.trim();
                if (v.isEmpty()) continue;
                approvalMapper.insertShopDetail(id, v, userId);
            }
        }

        if (deletedImgSeq != null) {
            for (Integer seq : deletedImgSeq) {
                if (seq == null) continue;
                approvalMapper.deleteShopImgBySeq(id, seq);
            }
        }

        if (images != null && images.length > 0) {
            Integer maxSeq = approvalMapper.selectMaxImgSeq(id);
            int startSeq = (maxSeq == null ? 0 : maxSeq) + 1;
            saveShopImagesAppend(id, images, startSeq);
        }

        if (mainImgSeq != null) {
            approvalMapper.resetMainImg(id);
            approvalMapper.setMainImg(id, mainImgSeq);
        } else {
            Integer currentMain = approvalMapper.selectMainImgSeq(id);
            if (currentMain == null) {
                Integer first = approvalMapper.selectFirstImgSeq(id);
                if (first != null) {
                    approvalMapper.resetMainImg(id);
                    approvalMapper.setMainImg(id, first);
                }
            }
        }
    }

    private void saveShopImagesAppend(String shopId, MultipartFile[] images, int startSeq) {
        try {
            Path dir = Paths.get(uploadRoot, "shopImg", shopId).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            int seq = startSeq;
            for (int i = 0; i < images.length; i++) {
                MultipartFile file = images[i];
                if (file == null || file.isEmpty()) continue;

                String original = file.getOriginalFilename();
                String safe = (original == null) ? "image" : original.replaceAll("[^a-zA-Z0-9._-]", "_");
                String fileName = System.currentTimeMillis() + "_" + i + "_" + safe;

                Path target = dir.resolve(fileName);
                file.transferTo(target);

                String imgUrl = "/img/shopImg/" + shopId + "/" + fileName;
                String mainImg = "N";

                approvalMapper.insertShopImg(shopId, seq, imgUrl, mainImg);
                seq++;
            }
        } catch (Exception e) {
            throw new IllegalStateException("이미지 저장 실패", e);
        }
    }

    @Transactional
    public void deleteApproval(String id, CustomUserDetails principal) {
        if (principal == null) throw new IllegalStateException("UNAUTHORIZED");
        assertOwner(id, principal);

        approvalMapper.deleteShopDetail(id);
        approvalMapper.deleteShopImg(id);
        approvalMapper.deleteShop(id);
    }
}
