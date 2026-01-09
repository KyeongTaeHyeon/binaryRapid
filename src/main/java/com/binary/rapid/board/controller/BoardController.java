package com.binary.rapid.board.controller;

import com.binary.rapid.board.dto.BoardCommentDto;
import com.binary.rapid.board.dto.BoardDto;
import com.binary.rapid.board.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

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
    public ResponseEntity<Integer> saveBoard(BoardDto boardDto) { // @RequestBody를 삭제했습니다.
        // 여기서 값이 잘 들어오는지 로그로 확인해 보세요.
        System.out.println("받은 제목: " + boardDto.getTitle());
        System.out.println("받은 내용: " + boardDto.getContents());

        int boardId = boardService.saveBoard(boardDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(boardId);
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateBoard(@RequestBody BoardDto boardDto) {
        // 로그를 찍어 값이 잘 들어오는지 확인하세요
        System.out.println("수정 요청 데이터: " + boardDto.toString());

        boardService.updateBoard(boardDto);
        return ResponseEntity.ok("success");
    }

    // --- 파일 관련 ---

    @PostMapping("/file/upload")
    public ResponseEntity<String> uploadFiles(
            @RequestParam("id") int id,
            @RequestParam("userId") int userId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("fileSeqs") int[] fileSeqs) {

        try {
            for (int i = 0; i < files.length; i++) {
                boardService.saveFileWithOrder(id, files[i], fileSeqs[i], userId);
            }
            return ResponseEntity.ok("success");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("파일 업로드 실패");
        }
    }
    @GetMapping("/board/boardEdit")
    public String boardEditPage(@RequestParam("id") int id) {
        return "board/boardEdit"; // templates/board/boardEdit.html 파일을 찾아감
    }

    // --- 댓글 관련 ---

    // 1. 댓글 등록
    @PostMapping("/comment/write")
    public ResponseEntity<String> saveComment(@RequestBody BoardCommentDto boardCommentDto) {
        boardService.saveComment(boardCommentDto);
        return ResponseEntity.ok("success");
    }

    // 2. 댓글 목록 조회 (중복되었던 /api/board 경로 제거)
    @GetMapping("/comment/list/{id}")
    public ResponseEntity<List<BoardCommentDto>> getCommentList(@PathVariable("id") int id) {
        List<BoardCommentDto> list = boardService.getCommentList(id);
        return ResponseEntity.ok(list);
    }

    // 3. 댓글 수정 (JS의 fetch 방식에 맞춰 @PostMapping 사용 가능)
    @PostMapping("/comment/update")
    public ResponseEntity<String> updateComment(@RequestBody BoardCommentDto boardCommentDto) {
        boardService.updateComment(boardCommentDto);
        return ResponseEntity.ok("success");
    }

    // 4. 댓글 삭제 (JS 요청 방식에 맞춤: /api/board/comment/delete?id=..&commentSeq=..)
    @PostMapping("/comment/delete")
    public ResponseEntity<String> deleteComment(
            @RequestParam("id") int id,
            @RequestParam("commentSeq") int commentSeq) {
        boardService.deleteComment(id, commentSeq);
        return ResponseEntity.ok("success");
    }
}
