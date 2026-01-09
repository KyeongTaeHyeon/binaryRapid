package com.binary.rapid.admin.mapper;

import com.binary.rapid.admin.dto.AdminDto;
import com.binary.rapid.admin.dto.CategoryDto;
import com.binary.rapid.admin.dto.NoticeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {
    /*
    User 
    */
    List<AdminDto> selectUserList(
            @Param("category") String category,
            @Param("keyword") String keyword,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    void updateUserStatusToSuspend(int userId); // 정지

    void updateUserStatusToRestore(int userId); // 복구

    /*
    Noice
    */
    List<NoticeDto> selectNoticeList(
            @Param("type") String type,
            @Param("keyword") String keyword
    );

    void insertNotice(NoticeDto noticeDto);

    void updateNotice(NoticeDto noticeDto);

    /*
    Category 
    */
    // Category 관련 메서드
    List<CategoryDto> selectCategoryGroups();

    List<CategoryDto> selectCategoryListByGroup(@Param("groupId") String groupId);

    int countByPrefix(@Param("prefix") String prefix);

    String selectMaxIdByPrefix(@Param("prefix") String prefix);

    String selectSampleIdByGroupId(@Param("groupId") String groupId);

    void insertCategory(CategoryDto dto);

    void updateCategory(CategoryDto dto);

    void deleteCategory(@Param("id") String id);
}
