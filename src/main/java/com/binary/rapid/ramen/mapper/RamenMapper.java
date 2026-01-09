package com.binary.rapid.ramen.mapper;

import com.binary.rapid.ramen.dto.RamenCateDto;
import com.binary.rapid.ramen.dto.RamenInfoDto;
import com.binary.rapid.ramen.dto.RamenPopupDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface RamenMapper {
    List<RamenCateDto> matchPopupCate();
    List<RamenInfoDto> showHeroInfo();
    List<RamenInfoDto> showSectInfo1();
    List<RamenInfoDto> showSectInfo2();
    List<RamenPopupDto> showPopup();
}
