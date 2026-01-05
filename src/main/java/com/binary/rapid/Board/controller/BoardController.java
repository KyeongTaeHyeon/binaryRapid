package com.binary.rapid.Board.controller; // 프로젝트 패키지 구조에 맞춰 수정하세요.

import com.binary.rapid.Board.dto.BoardCommentDto;
import com.binary.rapid.Board.dto.BoardDto;
import com.binary.rapid.Board.service.BoardService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RequestMapping("/api/board")
@RestController
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;

    @GetMapping("/list")
    public List<BoardDto> getBoardList() {
        return boardService.getBoardList();
    }

    //상세 조회
    @GetMapping("detail/{id}")
    public BoardDto getBoardDetail(@PathVariable("id") int id) {
        return boardService.getBoardDetail(id);
    }

    //삭제
    @DeleteMapping("/delete/{id}")
    public String deleteBoard(@PathVariable("id") int id) {
        boardService.deleteBoard(id);
        return "삭제완료";
    }

    @PostMapping("/write")
    public int saveBoard(@RequestBody BoardDto boardDto) {
        return boardService.saveBoard(boardDto);
    }

    @PutMapping("/update")
    public String updateBoard(@RequestBody BoardDto boardDto) {
        boardService.updateBoard(boardDto);
        return "수정 완료";
    }
    @PostMapping("/file/upload")
    public String uploadFiles(
            @RequestParam("id") int id,
            @RequestParam("userId") String userId, // FormData는 String으로 옴
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("fileSeqs") int[] fileSeqs) throws IOException {

        // String userId -> int 변환
        int userIdInt = Integer.parseInt(userId);

        for (int i = 0; i < files.length; i++) {
            boardService.saveFileWithOrder(id, files[i], fileSeqs[i], userIdInt);
        }
        return "success";
    }

    // 댓글 등록
    @PostMapping("/comment/write")
    public String commentWrite(@RequestBody BoardCommentDto commentDto) {
        boardService.saveComment(commentDto);
        return "success";
    }

    // 댓글 수정
    @PutMapping("/comment/update")
    public String updateComment(@RequestBody BoardCommentDto commentDto) {
        boardService.updateComment(commentDto);
        return "success";
    }


    // 댓글 삭제
    @DeleteMapping("/comment/delete/{id}/{commentSeq}")
    public String deleteComment(@PathVariable("id") int id, @PathVariable("commentSeq") int commentSeq) {
        boardService.deleteComment(id, commentSeq);
        return "success";
    }
}

