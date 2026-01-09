package com.binary.rapid.admin.service;

import com.binary.rapid.admin.dto.AdminDto;
import com.binary.rapid.admin.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminMapper adminMapper;

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
}
