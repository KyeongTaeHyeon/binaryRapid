package com.binary.rapid.user.controller;

import com.binary.rapid.user.dto.UserMyReqShopDto;
import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.dto.WishlistResponseDto;
import com.binary.rapid.user.dto.myBoardDto;
import com.binary.rapid.user.global.security.CustomUserDetails;
import com.binary.rapid.user.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Slf4j
@ResponseBody
@RequestMapping("/user/api/my")
@RestController
public class UserMyPageController {

    @Autowired
    UserService service;

    // 유저마이 페이지 게시글 관리
    // UserMyPageController.java 수정 제안
    @GetMapping("/board")
    public ResponseEntity<?> myBoardList(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // userDetails 내부의 User 객체에서 ID를 꺼내옵니다.
        List<myBoardDto> result = service.getMyBoards(userDetails.getUser().getUserId());
        return ResponseEntity.ok(result);
    }
    // 유저 마이페이지 개인정보 변경
    @PostMapping("/update")
    public ResponseEntity<?> updateMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails, // 현재 인증된 유저 정보
            @RequestBody UserResponseDto updateRequestDto         // JS에서 보낸 JSON 데이터
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        log.info("수정하고자 하는 유저 데이터 확인 form: "+ updateRequestDto.toString());
        
        try {
            // 서비스에서 비밀번호 검증과 수정을 동시에 처리
            UserResponseDto result = service.updateMyInfo(updateRequestDto);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            // 비밀번호가 틀렸을 경우 등 예외 처리
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정 중 오류가 발생했습니다.");
        }
    }

    // 찜 목록 가져오기
    @GetMapping("/wishlist")
    public ResponseEntity<List<WishlistResponseDto>> getWishlist(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<WishlistResponseDto> list = service.getWishlistByUserId(userDetails.getUser().getUserId());
        return ResponseEntity.ok(list);
    }

    // 찜 삭제하기
    @DeleteMapping("/wishlist")
    public ResponseEntity<String> removeWish(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestParam("shopId") String shopId) {
        boolean deleted = service.removeWishlist(userDetails.getUser().getUserId(), shopId);
        return deleted ? ResponseEntity.ok("success") : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("fail");
    }

    @GetMapping("/reqShopList")
    public ResponseEntity<List<UserMyReqShopDto>> getMyRequestShopList(@RequestParam("userId") int userId) {
        // 이제 토큰에서 꺼내지 않고, JS가 보내준 userId를 파라미터로 직접 받습니다.
        List<UserMyReqShopDto> list = service.getBoardListByUserId(userId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteUser(
            @RequestBody Map<String, Object> payload) {

        // JS에서 보낸 데이터 추출
        int userId = (int) payload.get("userId");
        String password = (String) payload.get("password");

        boolean isDeleted = service.deleteUser(userId, password);

        if (isDeleted) {
            return ResponseEntity.ok("탈퇴 처리가 완료되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("비밀번호가 일치하지 않거나 유저를 찾을 수 없습니다.");
        }
    }
    // 예시 컨트롤러
    @GetMapping("/filter")
    public ResponseEntity<List<UserMyReqShopDto>> getMyBoardList(
            @AuthenticationPrincipal CustomUserDetails userDetails, // JWT를 통해 파싱된 유저 정보
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        // 1. 유저 ID 추출 (로그인 체크)
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        int userId = userDetails.getUserId(); // CustomUserDetails에 정의된 PK(int) 값

        // 2. 파라미터를 Map에 담기 (Mapper의 <if> 조건문과 key값이 일치해야 함)
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("category", category);
        params.put("title", title);
        params.put("startDate", startDate);
        params.put("endDate", endDate);

        // 3. 서비스 호출 (Mapper의 selectMyBoardList를 실행하는 메서드)
        List<UserMyReqShopDto> boardList = service.getMyBoardList(params);

        return ResponseEntity.ok(boardList);
    }
    
}
