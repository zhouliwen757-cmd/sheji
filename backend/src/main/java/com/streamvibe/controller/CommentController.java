package com.streamvibe.controller;

import com.streamvibe.dto.ApiResponse;
import com.streamvibe.dto.CommentRequest;
import com.streamvibe.entity.Comment;
import com.streamvibe.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    
    private final CommentService commentService;
    
    @GetMapping("/video/{videoId}")
    public ResponseEntity<ApiResponse<Page<Comment>>> getVideoComments(
            @PathVariable @NonNull Long videoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Comment> comments = commentService.getCommentsByVideo(videoId, page, size);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }
    
    @GetMapping("/video/{videoId}/hot")
    public ResponseEntity<ApiResponse<List<Comment>>> getHotComments(@PathVariable @NonNull Long videoId) {
        List<Comment> comments = commentService.getHotComments(videoId);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }
    
    @GetMapping("/{id}/replies")
    public ResponseEntity<ApiResponse<List<Comment>>> getReplies(@PathVariable @NonNull Long id) {
        List<Comment> replies = commentService.getReplies(id);
        return ResponseEntity.ok(ApiResponse.success(replies));
    }
    
    @PostMapping("/video/{videoId}")
    public ResponseEntity<ApiResponse<Comment>> createComment(
            @PathVariable @NonNull Long videoId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        Comment comment = commentService.createComment(
            userId, videoId, request.getContent(), request.getParentId());
        return ResponseEntity.ok(ApiResponse.success("评论成功", comment));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable @NonNull Long id, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        commentService.deleteComment(id, userId);
        return ResponseEntity.ok(ApiResponse.success("评论已删除"));
    }
}
