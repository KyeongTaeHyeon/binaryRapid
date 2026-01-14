// src/main/java/com/binary/rapid/board/controller/BoardController.java
package com.binary.rapid.board.controller;

import com.binary.rapid.board.dto.BoardCommentDto;
import com.binary.rapid.board.dto.BoardDto;
import com.binary.rapid.board.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.unit.DataSize;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.setDisallowedFields("files");
    }

    // yml에 설정된 파일 용량 제한 값을 가져옵니다.
    @Value("${spring.servlet.multipart.max-file-size}")
    private DataSize maxFileSize;

    @Value("${spring.servlet.multipart.max-request-size}")
    private DataSize maxRequestSize;

    // 프론트엔드(JS)가 용량 제한을 물어보면 알려주는 API
    @GetMapping("/config")
    public ResponseEntity<Map<String, Long>> getBoardConfig() {
        return ResponseEntity.ok(Map.of(
                "maxFileSize", maxFileSize.toBytes(),
                "maxRequestSize", maxRequestSize.toBytes()
        ));
    }

    // --- 게시글 관련 ---
    @GetMapping("/list")
    public ResponseEntity<List<BoardDto>> getBoardList() {
        List<BoardDto> boardList = boardService.getBoardList();
        return ResponseEntity.ok(boardList);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<BoardDto> getBoardDetail(@PathVariable("id") int id) {
        BoardDto boardDetail = boardService.getBoardDetail(id);
        return ResponseEntity.ok(boardDetail);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteBoard(@PathVariable("id") int id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok("삭제 완료");
    }

    @PostMapping("/write")
    public ResponseEntity<Map<String, Object>> writeBoard(
            @ModelAttribute BoardDto boardDto,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {

        try {
            boardService.writeBoard(boardDto, files);

            // ✅ multipart 객체(files)를 절대 응답에 포함하지 않음 (Jackson 직렬화 에러 방지)
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", boardDto.getId()
            ));

        } catch (Exception e) {
            log.error("writeBoard failed", e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "실패"
            ));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateBoard(@RequestBody BoardDto boardDto) {
        System.out.println("수정 요청 데이터: " + boardDto.toString());
        log.info("수정 요청 데이터: " + boardDto.toString());
        boardService.updateBoard(boardDto);
        return ResponseEntity.ok("success");
    }

    // [이미지 출력 API]
    @GetMapping("/file/display")
    public ResponseEntity<org.springframework.core.io.Resource> displayFile(@RequestParam("path") String path) {
        try {
            String projectPath = System.getProperty("user.dir") + "/src/main/resources/static";
            String fullPath = projectPath + path;

            java.nio.file.Path filePath = java.nio.file.Paths.get(fullPath);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = java.nio.file.Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/boardEdit")
    public String boardEditPage(@RequestParam("id") int id) {
        return "board/boardEdit";
    }

    // --- 댓글 관련 ---

    @PostMapping("/comment/write")
    public ResponseEntity<String> saveComment(@RequestBody BoardCommentDto boardCommentDto) {
        boardService.saveComment(boardCommentDto);
        return ResponseEntity.ok("success");
    }

    @GetMapping("/comment/list/{id}")
    public ResponseEntity<List<BoardCommentDto>> getCommentList(@PathVariable("id") int id) {
        List<BoardCommentDto> list = boardService.getCommentList(id);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/comment/update")
    public ResponseEntity<String> updateComment(@RequestBody BoardCommentDto boardCommentDto) {
        boardService.updateComment(boardCommentDto);
        return ResponseEntity.ok("success");
    }

    @PostMapping("/comment/delete")
    public ResponseEntity<String> deleteComment(
            @RequestParam("id") int id,
            @RequestParam("commentSeq") int commentSeq) {
        boardService.deleteComment(id, commentSeq);
        return ResponseEntity.ok("success");
    }
}
