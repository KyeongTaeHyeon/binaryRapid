package com.binary.rapid.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.root}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. 동적 업로드 파일 경로 매핑 (예: /img/shopImg/...)
        //    - 캐시 설정: 1시간 동안 브라우저 캐싱 허용
        registry.addResourceHandler("/img/**")
                .addResourceLocations("file:" + uploadPath + "/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS));

        // 2. 정적 리소스 경로 매핑 (예: /images/no_image.png)
        //    - 캐시 설정: 1일 동안 브라우저 캐싱 허용 (정적 파일은 더 길게 설정 가능)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.DAYS));
    }
}
