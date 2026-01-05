package com.binary.rapid.ramen.controller;

import com.binary.rapid.ramen.dto.RamenInfoDto;
import com.binary.rapid.ramen.dto.RamenPopupDto;
import com.binary.rapid.ramen.service.RamenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController // JSON 형태로 데이터를 응답할 때 사용합니다.
@RequiredArgsConstructor // RamenService를 주입받기 위해 사용합니다.
public class RamenController {

    private final RamenService ramenService;


    @GetMapping("/api/ramen/sect1")
    public List<RamenInfoDto> getSect1() {
        System.out.println(">>> 컨트롤러 진입: Sect1 요청 받음");
        return ramenService.showInfoSect1();
    }

    // Sect2용 컨트롤러
    @GetMapping("/api/ramen/sect2")
    public List<RamenInfoDto> getSect2() {
        System.out.println(">>> 컨트롤러 진입: Sect2 요청 받음");
        return ramenService.showInfoSect2();
    }
    @GetMapping("/api/ramen/popup")
    public List<RamenPopupDto> getPopup() {
        System.out.println(">>> 컨트롤러 진입: popup 요청 받음");
        return ramenService.showModal();
    }

}
