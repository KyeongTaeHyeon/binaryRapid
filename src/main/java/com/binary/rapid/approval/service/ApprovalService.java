package com.binary.rapid.approval.service;

import com.binary.rapid.approval.dto.ApprovalDto;
import com.binary.rapid.approval.dto.ApprovalDetailDto;
import com.binary.rapid.approval.mapper.ApprovalMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.binary.rapid.user.global.security.CustomUserDetails;
import org.springframework.security.core.GrantedAuthority;
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

    private boolean isAdmin(CustomUserDetails principal) {
        if (principal == null) return false;
        try {
            for (GrantedAuthority a : principal.getAuthorities()) {
                if (a != null && "ROLE_ADMIN".equals(a.getAuthority())) return true;
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    private void assertOwnerOrAdmin(String shopId, CustomUserDetails principal) {
        if (principal == null) throw new IllegalStateException("UNAUTHORIZED");

        Integer ownerUserId = approvalMapper.selectShopOwnerUserId(shopId);
        if (ownerUserId == null) throw new IllegalStateException("NOT_FOUND");

        int me = principal.getUserId();
        if (ownerUserId != me && !isAdmin(principal)) {
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
                                 MultipartFile[] images,                 // ✅ 추가
                                 CustomUserDetails principal) {
        int userId = principal.getUserId();
        // ✅ tb_shop.id 규칙: RS + SEQ(10자리)
        // 현재 RS로 시작하는 id 중 최대 SEQ를 조회해서 +1
        Integer maxSeq = approvalMapper.selectMaxRsSeq();
        int nextSeq = (maxSeq == null ? 0 : maxSeq) + 1;
        String id = "RS" + String.format("%010d", nextSeq);

        approvalMapper.insertShop(id, name, address, content, userId);

        if (categories != null) {
            for (String c : categories) {
                if (c == null) continue;
                String v = c.trim();
                if (v.isEmpty()) continue;
                approvalMapper.insertShopDetail(id, v, userId); // ✅ 여기 userId 깨진 거 있으면 정상화
            }
        }

        // ✅ 여기서 이미지 저장
        if (images != null && images.length > 0) {
            saveShopImagesToStatic(id, images);
        }

        return id;
    }

    private void saveShopImagesToStatic(String shopId, MultipartFile[] images) {
        try {
            // ✅ 너가 원하는 경로
            Path dir = Paths.get(System.getProperty("user.dir"),
                    "src", "main", "resources", "static", "img", "shopImg", shopId);
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

                // ✅ DB에 저장될 URL (브라우저에서 바로 접근)
                String imgUrl = "/img/shopImg/" + shopId + "/" + fileName;
                String mainImg = (seq == 1) ? "Y" : "N";

                approvalMapper.insertShopImg(shopId, seq, imgUrl, mainImg);
                seq++;
            }
        } catch (Exception e) {
            throw new IllegalStateException("이미지 저장 실패", e);
        }
    }

    /**
     * 수정
     * - 기본정보(tb_shop) 업데이트
     * - 카테고리(tb_shopdetail)는 전체 삭제 후 재등록
     * - 이미지(tb_shopimg)는 선택 삭제 + 새 이미지 추가(append)
     * - 대표이미지(main_img): mainImgSeq가 있으면 그걸로 지정, 없으면 대표가 없을 때 첫번째 이미지로 자동 지정
     */
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
        // ✅ 작성자 또는 관리자만 수정 가능
        assertOwnerOrAdmin(id, principal);

        // 1) tb_shop 업데이트
        approvalMapper.updateShop(id, name, address, content);

        // 2) 카테고리: 전체 삭제 후 재등록(현재 구조 그대로 유지)
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

        // 3) 이미지 선택 삭제(요청된 seq만)
        if (deletedImgSeq != null) {
            for (Integer seq : deletedImgSeq) {
                if (seq == null) continue;
                approvalMapper.deleteShopImgBySeq(id, seq);
            }
        }

        // 4) 새 이미지 추가(append)
        if (images != null && images.length > 0) {
            Integer maxSeq = approvalMapper.selectMaxImgSeq(id);
            int startSeq = (maxSeq == null ? 0 : maxSeq) + 1;
            saveShopImagesToStaticAppend(id, images, startSeq);
        }

        // 5) 대표 이미지 처리
        if (mainImgSeq != null) {
            approvalMapper.resetMainImg(id);
            approvalMapper.setMainImg(id, mainImgSeq);
        } else {
            // 대표가 없으면 자동으로 첫번째 이미지를 대표로 지정
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

    private void saveShopImagesToStaticAppend(String shopId, MultipartFile[] images, int startSeq) {
        try {
            Path dir = Paths.get(System.getProperty("user.dir"),
                    "src", "main", "resources", "static", "img", "shopImg", shopId);
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
                // 수정에서는 우선 신규는 N으로 저장하고, 마지막에 대표 처리 로직으로 확정
                String mainImg = "N";

                approvalMapper.insertShopImg(shopId, seq, imgUrl, mainImg);
                seq++;
            }
        } catch (Exception e) {
            throw new IllegalStateException("이미지 저장 실패", e);
        }
    }

    /**
     * 삭제
     */
    @Transactional
    public void deleteApproval(String id, CustomUserDetails principal) {
        if (principal == null) throw new IllegalStateException("UNAUTHORIZED");
        // ✅ 작성자 또는 관리자만 삭제 가능
        assertOwnerOrAdmin(id, principal);

        approvalMapper.deleteShopDetail(id);
        approvalMapper.deleteShopImg(id);
        approvalMapper.deleteShop(id);
    }
}
