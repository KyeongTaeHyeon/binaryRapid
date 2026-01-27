package com.binary.rapid.board.service;

import com.binary.rapid.admin.dto.NoticeDto;
import com.binary.rapid.admin.mapper.AdminMapper;
import com.binary.rapid.board.dto.BoardCommentDto;
import com.binary.rapid.board.dto.BoardDto;
import com.binary.rapid.board.dto.BoardFileDto;
import com.binary.rapid.board.mapper.BoardMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Log4j2
@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardMapper boardMapper;
    private final AdminMapper adminMapper; // 공지사항 조회를 위해 추가

    @Value("${app.upload.root}")
    private String uploadRoot;

    // 1. 게시글 목록 조회
    public List<BoardDto> getBoardList() {
        return boardMapper.selectBoardList();
    }

    // [추가] 사용자용 공지사항 목록 조회 (게시판 상단 노출용)
    public List<NoticeDto> getNoticeListForUser() {
        // AdminMapper의 selectNoticeList를 활용하되, 사용자 화면이므로 검색어 없이 전체 노출
        // (필요 시 notice_YN='Y' 조건이 Mapper에 이미 있거나 추가해야 함)
        return adminMapper.selectNoticeList(null, null);
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
        // 0) 첨부파일 목록을 미리 확보(삭제 처리 전에 file_addr 보존)
        List<BoardFileDto> files = boardMapper.selectAllFileList(id);

        // 1) 파일 레코드 soft delete
        boardMapper.deleteBoardFilesByBoardId(id);

        // 2) 실제 파일 물리 삭제 (실패해도 DB 삭제는 진행)
        if (files != null) {
            Path root = Paths.get(uploadRoot).normalize().toAbsolutePath();
            for (BoardFileDto f : files) {
                if (f == null) continue;
                String key = f.getFileAddr();
                if (key == null || key.isBlank()) continue;

                try {
                    Path target = root.resolve(key).normalize();
                    if (!target.startsWith(root)) {
                        log.warn("Skip deleting file (invalid key): {}", key);
                        continue;
                    }
                    Files.deleteIfExists(target);
                } catch (Exception e) {
                    log.warn("Failed to delete file for boardId={}, fileSeq={}, key={}", id, f.getFileSeq(), key, e);
                }
            }
        }

        // 3) 댓글/게시글 soft delete
        boardMapper.deleteCommentsByBoardId(id);
        boardMapper.deleteBoard(id);
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
            // 옵션 B: app 외부 업로드 루트 하위에 저장
            // 예) {uploadRoot}/board/{boardId}/
            Path boardDir = Paths.get(uploadRoot, "board", String.valueOf(boardId));
            Files.createDirectories(boardDir);

            int fileSeq = 1;

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;

                String original = file.getOriginalFilename();
                String safeOriginal = (original == null) ? "file" : original.replaceAll("[^a-zA-Z0-9._-]", "_");

                String saveFileName = UUID.randomUUID() + "_" + safeOriginal;
                Path target = boardDir.resolve(saveFileName);

                file.transferTo(target);

                // DB 저장: 외부 폴더의 '상대키'를 저장 (URL 아님)
                // 예) board/123/uuid_name.png
                String storageKey = Paths.get("board", String.valueOf(boardId), saveFileName).toString().replace('\\', '/');

                BoardFileDto fileDto = new BoardFileDto();
                fileDto.setId(boardId);
                fileDto.setFileSeq(fileSeq++);
                fileDto.setFileAddr(storageKey);
                fileDto.setUserId(userId);

                boardMapper.insertBoardFile(fileDto);
            }
        }
    }

    @Transactional(readOnly = true)
    public BoardFileDto getBoardFile(int id, int fileSeq) {
        return boardMapper.selectBoardFile(id, fileSeq);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateBoardWithFiles(BoardDto boardDto, List<Integer> deleteFileSeqs, List<MultipartFile> newFiles) throws IOException {
        // 1) 게시글 본문 업데이트 (작성자 검증은 mapper WHERE user_id 조건으로 수행)
        boardMapper.updateBoard(boardDto);

        final int boardId = boardDto.getId();
        final int userId = boardDto.getUserId();

        // 2) 기존 첨부 삭제(soft delete + 물리 삭제)
        if (deleteFileSeqs != null) {
            Path root = Paths.get(uploadRoot).normalize().toAbsolutePath();

            for (Integer seq : deleteFileSeqs) {
                if (seq == null) continue;

                // 2-1) storageKey 확보(soft delete 전에)
                BoardFileDto fileDto = boardMapper.selectBoardFile(boardId, seq);
                if (fileDto != null) {
                    String key = fileDto.getFileAddr();
                    if (key != null && !key.isBlank()) {
                        try {
                            Path target = root.resolve(key).normalize();
                            if (target.startsWith(root)) {
                                Files.deleteIfExists(target);
                            } else {
                                log.warn("Skip deleting file (invalid key) boardId={}, fileSeq={}, key={}", boardId, seq, key);
                            }
                        } catch (Exception e) {
                            log.warn("Failed to delete file on update boardId={}, fileSeq={}", boardId, seq, e);
                        }
                    }
                }

                // 2-2) DB soft delete
                boardMapper.deleteBoardFile(boardId, seq);
            }
        }

        // 3) 신규 첨부 추가(append)
        if (newFiles != null && !newFiles.isEmpty()) {
            Path boardDir = Paths.get(uploadRoot, "board", String.valueOf(boardId));
            Files.createDirectories(boardDir);

            int fileSeq = boardMapper.selectMaxFileSeq(boardId) + 1;

            for (MultipartFile file : newFiles) {
                if (file == null || file.isEmpty()) continue;

                String original = file.getOriginalFilename();
                String safeOriginal = (original == null) ? "file" : original.replaceAll("[^a-zA-Z0-9._-]", "_");

                String saveFileName = UUID.randomUUID() + "_" + safeOriginal;
                Path target = boardDir.resolve(saveFileName);
                file.transferTo(target);

                String storageKey = Paths.get("board", String.valueOf(boardId), saveFileName).toString().replace('\\', '/');

                BoardFileDto fileDto = new BoardFileDto();
                fileDto.setId(boardId);
                fileDto.setFileSeq(fileSeq++);
                fileDto.setFileAddr(storageKey);
                fileDto.setUserId(userId);

                boardMapper.insertBoardFile(fileDto);
            }
        }
    }
}
