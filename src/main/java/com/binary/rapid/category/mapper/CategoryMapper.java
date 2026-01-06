package com.binary.rapid.category.mapper;

import com.binary.rapid.category.form.CategoryForm;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CategoryMapper {
    List<CategoryForm> allCategory();

    List<CategoryForm> findCategory(String groupId);
}
