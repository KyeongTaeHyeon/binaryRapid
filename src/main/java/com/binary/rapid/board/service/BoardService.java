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
        return boardMapper.selectBoardDetail(id);
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
    public void saveFileWithOrder(int id, MultipartFile file, int fileSeq, int userId) throws IOException {
        if (file != null && !file.isEmpty()) {
            String projectPath = System.getProperty("user.dir") + "/src/main/resources/static/files";

            File directory = new File(projectPath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File saveFile = new File(projectPath, fileName);
            file.transferTo(saveFile);

            BoardFileDto fileDto = new BoardFileDto();
            fileDto.setId(id);
            fileDto.setFileSeq(fileSeq);
            fileDto.setFileAddr("/files/" + fileName);
            fileDto.setUserId(userId);

            boardMapper.insertBoardFile(fileDto);
        }
    }


}