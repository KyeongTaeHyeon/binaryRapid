package com.binary.rapid.admin.dto; // 패키지명 확인

import com.binary.rapid.user.constant.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDto {

    private int userId;
    private String id;
    private String password;
    private String nickName;
    private UserRole role;

    private String email;
    private String taste;
    private String birth;   // "19950505"
    private String gender;  // "M" or "F"

    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private LocalDateTime deleteDate;

    // --- [화면 출력용 편의 메서드 추가] ---

    // 1. 나이 계산 (Thymeleaf에서 ${user.age} 로 사용 가능)
    public int getAge() {
        if (birth == null || birth.length() < 4) return 0;
        try {
            int birthYear = Integer.parseInt(birth.substring(0, 4));
            int currentYear = LocalDateTime.now().getYear();
            return currentYear - birthYear + 1; // 한국 나이
        } catch (Exception e) {
            return 0;
        }
    }

    // 2. 성별 변환 (Thymeleaf에서 ${user.genderLabel} 로 사용 가능)
    public String getGenderLabel() {
        if ("M".equalsIgnoreCase(gender)) return "남";
        if ("F".equalsIgnoreCase(gender)) return "여";
        return "-";
    }
}
