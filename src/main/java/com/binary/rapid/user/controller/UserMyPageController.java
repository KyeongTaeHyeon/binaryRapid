package com.binary.rapid.user.controller;

import com.binary.rapid.user.dto.UserResponseDto;
import com.binary.rapid.user.dto.WishlistResponseDto;
import com.binary.rapid.user.dto.myBoardDto;
import com.binary.rapid.user.global.security.CustomUserDetails;
import com.binary.rapid.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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
}
