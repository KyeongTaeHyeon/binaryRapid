package com.binary.rapid;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.binary.rapid")
public class RapidApplication {

    public static void main(String[] args) {
        SpringApplication.run(RapidApplication.class, args);
    }


}
