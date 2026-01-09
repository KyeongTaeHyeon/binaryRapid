package com.binary.rapid.ramen.service;

import com.binary.rapid.ramen.dto.RamenCateDto;
import com.binary.rapid.ramen.dto.RamenInfoDto;
import com.binary.rapid.ramen.dto.RamenPopupDto;
import com.binary.rapid.ramen.mapper.RamenMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class RamenService {
    private final RamenMapper ramenMapper;

    //    메인화면 히어로 영역 뿌리기
    public List<RamenInfoDto> showHeroInfo(){
        return ramenMapper.showHeroInfo();
    }

//    메인화면 정보전달 영역 뿌리기
    public List<RamenInfoDto> showInfoSect1(){
        return ramenMapper.showSectInfo1();
    };

    public  List<RamenInfoDto> showInfoSect2() {
        return ramenMapper.showSectInfo2();
    }
    //    메인화면 팝업 영역 데이터 뿌리기
    public List<RamenPopupDto> showModal(){
        return ramenMapper.showPopup();
    };

    public List<RamenCateDto> matchPopupCate(){
        return ramenMapper.matchPopupCate();
    };

}
