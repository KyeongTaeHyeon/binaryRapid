package com.binary.rapid.admin.mapper;

import com.binary.rapid.admin.dto.AdminDto;
import com.binary.rapid.admin.dto.NoticeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {
    List<AdminDto> selectUserList(
            @Param("category") String category,
            @Param("keyword") String keyword,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // [AdminMapper.java]
    void updateUserStatusToSuspend(int userId); // 정지

    void updateUserStatusToRestore(int userId); // 복구

    // Noice
    List<NoticeDto> selectNoticeList(
            @Param("type") String type,
            @Param("keyword") String keyword
    );

    void insertNotice(NoticeDto noticeDto);

    void updateNotice(NoticeDto noticeDto);
}
