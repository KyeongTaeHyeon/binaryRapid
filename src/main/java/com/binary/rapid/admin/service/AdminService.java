package com.binary.rapid.admin.service;

import com.binary.rapid.admin.dto.AdminDto;
import com.binary.rapid.admin.dto.CategoryDto;
import com.binary.rapid.admin.dto.NoticeDto;
import com.binary.rapid.admin.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminMapper adminMapper;

    /*
    User 
    */
    // Controller가 호출할 메서드
    public List<AdminDto> selectUserList(String category, String keyword, String startDate, String endDate) {
        return adminMapper.selectUserList(category, keyword, startDate, endDate);
    }

    // [AdminServiceImpl.java 구현체]
    public void changeUserStatus(int userId, String action) {
        // action이 'suspend'면 현재시간, 'restore'면 null 처리
        // Mapper에게 전달하기 쉽도록 처리
        if ("suspend".equals(action)) {
            adminMapper.updateUserStatusToSuspend(userId);
        } else if ("restore".equals(action)) {
            adminMapper.updateUserStatusToRestore(userId);
        }
    }

    /*
    Notice 
    */
    // 목록 조회
    public List<NoticeDto> getNoticeList(String type, String keyword) {
        return adminMapper.selectNoticeList(type, keyword);
    }

    // 등록
    public void addNotice(NoticeDto noticeDto) {
        // 필요 시 여기서 데이터 검증 로직 추가
        adminMapper.insertNotice(noticeDto);
    }

    // 공지사항 수정
    public void updateNotice(NoticeDto noticeDto) {
        adminMapper.updateNotice(noticeDto);
    }

    /*
    Category 
    */
    // 1. 좌측 그룹 목록
    public List<CategoryDto> getCategoryGroupList() {
        return adminMapper.selectCategoryGroups();
    }

    // 2. 우측 상세 목록
    public List<CategoryDto> getCategoryListByGroup(String groupId) {
        return adminMapper.selectCategoryListByGroup(groupId);
    }

    // 3. Prefix 중복 확인 (true: 사용가능)
    public boolean checkPrefixAvailable(String prefix) {
        return adminMapper.countByPrefix(prefix.toUpperCase()) == 0;
    }

    // 4. 저장 (신규/추가/수정 통합)
    @Transactional
    public void saveCategory(CategoryDto dto, String inputPrefix, boolean isNewGroup) {

        // [CASE A] 신규 등록 (ID가 없음)
        if (dto.getId() == null || dto.getId().isEmpty()) {
            String newId;

            // A-1. 완전히 새로운 그룹 생성 (Prefix 입력받음)
            if (isNewGroup && inputPrefix != null) {
                String prefix = inputPrefix.toUpperCase();

                // 이중 체크
                if (adminMapper.countByPrefix(prefix) > 0) {
                    throw new IllegalStateException("이미 사용 중인 코드입니다.");
                }
                newId = prefix + "1"; // 무조건 1번부터 시작
            }
            // A-2. 기존 그룹에 항목 추가
            else {
                // 기존 그룹의 ID 하나를 가져와서 Prefix(맨 앞글자) 추출
                String sampleId = adminMapper.selectSampleIdByGroupId(dto.getGroupId());
                String prefix = sampleId.substring(0, 1);

                // 해당 Prefix의 마지막 번호 조회 (예: R47)
                String maxId = adminMapper.selectMaxIdByPrefix(prefix);

                int nextNum = 1;
                if (maxId != null) {
                    // 숫자 부분만 발췌해서 +1
                    String numPart = maxId.substring(1);
                    nextNum = Integer.parseInt(numPart) + 1;
                }
                newId = prefix + nextNum; // 예: R48
            }

            dto.setId(newId);
            adminMapper.insertCategory(dto);
        }
        // [CASE B] 수정 (ID가 있음)
        else {
            adminMapper.updateCategory(dto);
        }
    }

    public void deleteCategory(String id) {
        adminMapper.deleteCategory(id);
    }
}
