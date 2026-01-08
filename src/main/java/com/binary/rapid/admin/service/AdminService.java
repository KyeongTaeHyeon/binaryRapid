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
}
