package com.binary.rapid.user.handler;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() {
        super("잘못된 비밀번호 입니다.");
    }
}
