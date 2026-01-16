package com.binary.rapid.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Log4j2
@Component
public class UploadRootInitializer {

    @Value("${app.upload.root}")
    private String uploadRoot;

    @PostConstruct
    public void init() {
        try {
            Path root = Paths.get(uploadRoot).toAbsolutePath().normalize();
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                log.info("Created upload root directory: {}", root.toString());
            } else {
                log.info("Upload root directory exists: {}", root.toString());
            }

            // 권한이 적절한지 간단 체크(쓰기 가능 여부)
            if (!Files.isWritable(root)) {
                log.warn("Upload root exists but is not writable by application user: {}. Please adjust permissions.", root.toString());
            }
        } catch (Exception e) {
            log.error("Failed to ensure upload root directory: {}", uploadRoot, e);
            // 애플리케이션 시작을 막지 않음(운영에서 수동 조치를 권장)
        }
    }
}

