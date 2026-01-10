package com.binary.rapid.board.mapper;

import com.binary.rapid.board.dto.BoardCommentDto;
import com.binary.rapid.board.dto.BoardDto;
import com.binary.rapid.board.dto.BoardFileDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardMapper {
    // 게시글
    List<BoardDto> selectBoardList();
    BoardDto selectBoardDetail(int id);
    void saveBoard(BoardDto boardDto);
    void updateBoard(BoardDto boardDto);
    void deleteBoard(int id);

    // 파일
    void insertBoardFile(BoardFileDto fileDto);
    List<BoardFileDto> selectFileList(int id);

    // 댓글
    List<BoardCommentDto> selectCommentList(int id);
    void insertComment(BoardCommentDto commentDto);
    void updateComment(BoardCommentDto commentDto);
    void deleteComment(@Param("id") int id, @Param("commentSeq") int commentSeq);


    void deleteCommentsByBoardId(int id);
    //카테고리 메퍼

}