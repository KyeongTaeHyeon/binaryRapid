package com.binary.rapid.ramen.controller;

import com.binary.rapid.ramen.dto.RamenCateDto;
import com.binary.rapid.ramen.dto.RamenInfoDto;
import com.binary.rapid.ramen.dto.RamenPopupDto;
import com.binary.rapid.ramen.service.RamenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController 
@RequiredArgsConstructor 
public class RamenController {

    private final RamenService ramenService;


    @GetMapping("/api/ramen/cate")
    public List<RamenCateDto> getCate(){
        return ramenService.matchPopupCate();
    }

    @GetMapping("/api/ramen/hero")
    public List<RamenInfoDto> getHero(){
        return ramenService.showHeroInfo();
    }

    @GetMapping("/api/ramen/sect1")
    public List<RamenInfoDto> getSect1() {
        return ramenService.showInfoSect1();
    }

    @GetMapping("/api/ramen/sect2")
    public List<RamenInfoDto> getSect2() {
        return ramenService.showInfoSect2();
    }
    @GetMapping("/api/ramen/popup")
    public List<RamenPopupDto> getPopup() {
        return ramenService.showModal();
    }

}
