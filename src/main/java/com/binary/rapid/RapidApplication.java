package com.binary.rapid;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication

@MapperScan("com.binary.rapid.shop.mapper")
@MapperScan("com.binary.rapid.user.mapper")
@MapperScan("com.binary.rapid.category.mapper")
@MapperScan("com.binary.rapid.ramen.mapper")
public class RapidApplication {

    public static void main(String[] args) {
        SpringApplication.run(RapidApplication.class, args);
    }
}
