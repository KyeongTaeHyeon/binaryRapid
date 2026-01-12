package com.binary.rapid.board.service;

import com.binary.rapid.board.dto.BoardCommentDto;
import com.binary.rapid.board.dto.BoardDto;
import com.binary.rapid.board.dto.BoardFileDto;
import com.binary.rapid.board.mapper.BoardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardMapper boardMapper;

    // 1. 게시글 목록 조회
    public List<BoardDto> getBoardList() {
        return boardMapper.selectBoardList();
    }

    // 2. 게시글 상세 조회
    public BoardDto getBoardDetail(int id) {
        BoardDto detail = boardMapper.selectBoardDetail(id);
        if (detail == null) return null;

        List<BoardFileDto> files = boardMapper.selectFileList(id);
        detail.setFiles(files != null ? files : Collections.emptyList());
        return detail;
    }

    // 3. 게시글 저장
    @Transactional(rollbackFor = Exception.class)
    public int saveBoard(BoardDto boardDto) {
        boardMapper.saveBoard(boardDto);
        return boardDto.getId();
    }

    // 4. 게시글 삭제
    @Transactional(rollbackFor = Exception.class)
    public void deleteBoard(int id) {
        boardMapper.deleteCommentsByBoardId(id); // 댓글 먼저 삭제 처리
        boardMapper.deleteBoard(id); // 게시글 삭제 처리
    }

    // 5. 게시글 수정
    public void updateBoard(BoardDto boardDto) {
        boardMapper.updateBoard(boardDto);
    }

    // --- 댓글 관련 ---
    @Transactional(rollbackFor = Exception.class)
    public void saveComment(BoardCommentDto commentDto) {
        boardMapper.insertComment(commentDto);
    }

    public List<BoardCommentDto> getCommentList(int id) {
        return boardMapper.selectCommentList(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateComment(BoardCommentDto commentDto) {
        boardMapper.updateComment(commentDto);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteComment(int id, int commentSeq) {
        boardMapper.deleteComment(id, commentSeq);
    }

    // --- 파일 관련 ---
    @Transactional(rollbackFor = Exception.class)
    public void writeBoard(BoardDto boardDto, List<MultipartFile> files) throws IOException {

        // 1. 게시글 저장
        boardMapper.saveBoard(boardDto);
        int boardId = boardDto.getId();
        int userId = boardDto.getUserId();

        // 2. 파일 저장
        if (files != null && !files.isEmpty()) {

            // 경로: 프로젝트 내부 static/img/attachFile/
            String projectPath = System.getProperty("user.dir") + "/src/main/resources/static/img/attachFile/";

            File directory = new File(projectPath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            int fileSeq = 1;

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                // 파일명 난수화
                String saveFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

                // 물리 저장
                file.transferTo(new File(projectPath, saveFileName));

                // DB 저장 (경로: /img/attachFile/...)
                BoardFileDto fileDto = new BoardFileDto();
                fileDto.setId(boardId);
                fileDto.setFileSeq(fileSeq++);
                fileDto.setFileAddr("/img/attachFile/" + saveFileName);
                fileDto.setUserId(userId);

                boardMapper.insertBoardFile(fileDto);
            }
        }
    }
}
