package com.binary.rapid.user.global.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final String code;    // 에러 코드 (예: "404", "USER_ERROR")
    private final String message; // 에러 메시지
    private final T data;         // 실제 데이터

    private ApiResponse(boolean success, String code, String message, T data) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // 1. 성공 응답 (데이터만)
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "200", "요청 성공", data);
    }

    // 2. 실패 응답 (상태 코드와 메시지를 직접 입력)
    // 예: ApiResponse.fail("400", "비밀번호가 틀렸습니다.")
    public static ApiResponse<?> fail(String code, String message) {
        return new ApiResponse<>(false, code, message, null);
    }

    // 3. 실패 응답 (Spring의 HttpStatus 활용)
    // 예: ApiResponse.fail(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다.")
    public static ApiResponse<?> fail(HttpStatus status, String message) {
        return new ApiResponse<>(false, String.valueOf(status.value()), message, null);
    }
}