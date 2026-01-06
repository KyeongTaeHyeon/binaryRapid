package com.binary.rapid.Board.service;

import com.binary.rapid.Board.dto.BoardCommentDto;
import com.binary.rapid.Board.dto.BoardDto;
import com.binary.rapid.Board.dto.BoardFileDto;
import com.binary.rapid.Board.mapper.BoardMapper;
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

    // 3. 게시글 저장 (추가: 트랜잭션 보장)
    @Transactional(rollbackFor = Exception.class)
    public int saveBoard(BoardDto boardDto) {
        boardMapper.saveBoard(boardDto);
        // XML에서 useGeneratedKeys="true" 설정을 했으므로 boardDto.getId()에 값이 채워집니다.
        return boardDto.getId();
    }

    // 4. 게시글 삭제 (수정: 댓글도 함께 삭제 처리)
    @Transactional(rollbackFor = Exception.class)
    public void deleteBoard(int id) {
        // XML에 정의한 deleteCommentsByBoardId를 호출하여 관련 댓글을 먼저 논리 삭제(delete_date 업데이트)합니다.
        // 외래키 제약조건이나 데이터 무결성을 위해 필수입니다.
        boardMapper.deleteCommentsByBoardId(id);

        // 게시글 본문 삭제 (논리 삭제)
        boardMapper.deleteBoard(id);
    }

    // 5. 게시글 수정 (추가: 트랜잭션 보장)
    @Transactional(rollbackFor = Exception.class)
    public void updateBoard(BoardDto boardDto) {
        boardMapper.updateBoard(boardDto);
    }

    // --- 댓글 관련 로직 ---

    @Transactional(rollbackFor = Exception.class)
    public void saveComment(BoardCommentDto commentDto) {
        boardMapper.insertComment(commentDto);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateComment(BoardCommentDto commentDto) {
        boardMapper.updateComment(commentDto);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteComment(int id, int commentSeq) {
        boardMapper.deleteComment(id, commentSeq);
    }

    // --- 파일 관련 로직 ---

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