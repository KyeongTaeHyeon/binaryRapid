package com.binary.rapid.ramen.service;

import com.binary.rapid.ramen.dto.RamenCateDto;
import com.binary.rapid.ramen.dto.RamenHeroDto;
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

    public List<RamenCateDto> matchPopupCate(){
        return ramenMapper.matchPopupCate();
    };


    public List<RamenHeroDto> showHeroInfo(){
        return ramenMapper.showHeroInfo();
    }

//    메인화면 정보전달 영역 뿌리기
    public List<RamenInfoDto> showInfoSect1(){


        return ramenMapper.showSectInfo1();

    };

    public  List<RamenInfoDto> showInfoSect2() {


        return ramenMapper.showSectInfo2();
    }

    public List<RamenPopupDto> showModal(){
        return ramenMapper.showPopup();
    };

}
