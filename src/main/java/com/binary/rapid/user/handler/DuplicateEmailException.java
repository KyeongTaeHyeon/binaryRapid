package com.binary.rapid.user.handler;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException() {
        super("이미 가입된 아이디입니다.");
    }
}