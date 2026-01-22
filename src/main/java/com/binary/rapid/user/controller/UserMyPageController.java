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
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UserResponseDto updateRequestDto
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // 1. 요청 데이터 로그 확인 (password가 null인지 혹은 "********"인지 확인용)
        log.info("수정 요청 데이터: {}, 유저 권한/타입: {}", updateRequestDto.toString(), userDetails.getAuthorities());

        try {
            // 2. 중요: JS에서 보낸 데이터의 userId가 현재 로그인한 유저의 PK와 일치하는지 보안 검증
            if (updateRequestDto.getUserId() != userDetails.getUserId()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("본인의 정보만 수정할 수 있습니다.");
            }

            // 서비스 호출
            UserResponseDto result = service.updateMyInfo(updateRequestDto);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            // 비밀번호 불일치 혹은 잘못된 인자 전달 시
            log.warn("수정 거부 (Bad Request): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("수정 중 서버 오류: ", e);
            // 에러 메시지를 상세하게 반환하여 디버깅 돕기
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정 중 오류가 발생했습니다: " + e.getMessage());
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
    public ResponseEntity<List<UserMyReqShopDto>> getMyRequestShopList(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        int userId = userDetails.getUserId();

        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("title", title);
        params.put("startDate", startDate);
        params.put("endDate", endDate);

        List<UserMyReqShopDto> list = service.getBoardListByUserId(params);
        return ResponseEntity.ok(list);
    }

    // 식당 신청 내역 삭제 API
    @DeleteMapping("/reqShop/{shopId}")
    public ResponseEntity<String> deleteRequestedShop(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("shopId") String shopId) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        boolean deleted = service.deleteRequestedShop(userDetails.getUserId(), shopId);

        if (deleted) {
            return ResponseEntity.ok("신청 내역이 성공적으로 삭제되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("신청 내역 삭제에 실패했습니다. 권한이 없거나 이미 처리된 내역일 수 있습니다.");
        }
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
