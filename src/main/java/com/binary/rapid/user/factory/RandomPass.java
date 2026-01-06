package com.binary.rapid.user.factory;

import java.security.SecureRandom;


// 문자, 특수문자, 숫자를 포함한 랜덤 숫자 생성기
public class RandomPass {

    private static final String CHAR_POOL =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                    "abcdefghijklmnopqrstuvwxyz" +
                    "0123456789" +
                    "!@#$%^&*()-_=+[]{};:,.<>?";

    private static final SecureRandom random = new SecureRandom();

    public static String generate(int length) {
        StringBuilder sb = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(CHAR_POOL.length());
            sb.append(CHAR_POOL.charAt(index));
        }

        return sb.toString();
    }

}
