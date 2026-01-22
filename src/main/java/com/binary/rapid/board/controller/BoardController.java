// src/main/java/com/binary/rapid/board/controller/BoardController.java
package com.binary.rapid.board.controller;

import com.binary.rapid.board.dto.BoardCommentDto;
import com.binary.rapid.board.dto.BoardDto;
import com.binary.rapid.board.dto.BoardFileDto;
import com.binary.rapid.board.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.unit.DataSize;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @Value("${app.upload.root}")
    private String uploadRoot;

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
        
        boardService.updateBoard(boardDto);
        return ResponseEntity.ok("success");
    }

    /**
     * 옵션 B: 외부 업로드 폴더에서 파일 제공
     * - DB의 tb_boardFile(file_addr)에 저장된 storageKey를 기반으로 읽어옴
     * - path 파라미터로 임의 파일을 읽게 하지 않고, boardId/seq로만 접근
     */
    @GetMapping("/file/{id}/{fileSeq}")
    public ResponseEntity<org.springframework.core.io.Resource> readBoardFile(
            @PathVariable("id") int id,
            @PathVariable("fileSeq") int fileSeq
    ) {
        try {
            BoardFileDto match = boardService.getBoardFile(id, fileSeq);
            if (match == null || match.getFileAddr() == null || match.getFileAddr().isBlank()) {
                return ResponseEntity.notFound().build();
            }

            // storageKey는 예: board/123/uuid_name.png
            Path root = Paths.get(uploadRoot).normalize().toAbsolutePath();
            Path target = root.resolve(match.getFileAddr()).normalize();

            // 디렉토리 트래버설 방지: 반드시 업로드 루트 하위여야 함
            if (!target.startsWith(root)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
            }

            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(target.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(target);
            if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, contentType);
            headers.setCacheControl("public, max-age=31536000");

            return ResponseEntity.ok().headers(headers).body(resource);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("readBoardFile failed", e);
            return ResponseEntity.status(500).build();
        }
    }

    // [이미지 출력 API] (기존 호환용) - path 파라미터는 보안상 위험하므로 제한적으로만 사용
    @GetMapping("/file/display")
    public ResponseEntity<org.springframework.core.io.Resource> displayFile(@RequestParam("path") String path) {
        try {
            // 과거 데이터(정적경로) 호환: path가 /img/... 처럼 들어오면 static 하위에서만 읽기
            String projectPath = System.getProperty("user.dir") + "/src/main/resources/static";
            String fullPath = projectPath + path;

            java.nio.file.Path root = java.nio.file.Paths.get(projectPath).normalize().toAbsolutePath();
            java.nio.file.Path filePath = java.nio.file.Paths.get(fullPath).normalize().toAbsolutePath();
            if (!filePath.startsWith(root)) {
                return ResponseEntity.badRequest().build();
            }

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
            log.error("displayFile failed", e);
            return ResponseEntity.status(500).build();
        }
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

    @PostMapping("/updateWithFiles")
    public ResponseEntity<Map<String, Object>> updateBoardWithFiles(
            @RequestParam("id") int id,
            @RequestParam("category") String category,
            @RequestParam("title") String title,
            @RequestParam("contents") String contents,
            @RequestParam("userId") int userId,
            @RequestParam(value = "deleteFileSeqs", required = false) String deleteFileSeqs,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            BoardDto dto = new BoardDto();
            dto.setId(id);
            dto.setCategory(category);
            dto.setTitle(title);
            dto.setContents(contents);
            dto.setUserId(userId);

            List<Integer> deleteSeqList = java.util.Collections.emptyList();
            if (deleteFileSeqs != null && !deleteFileSeqs.isBlank()) {
                deleteSeqList = java.util.Arrays.stream(deleteFileSeqs.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(Integer::parseInt)
                        .toList();
            }

            boardService.updateBoardWithFiles(dto, deleteSeqList, files);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("updateBoardWithFiles failed", e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "실패"
            ));
        }
    }
}
