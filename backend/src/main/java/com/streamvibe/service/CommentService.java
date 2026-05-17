package com.streamvibe.service;

import com.streamvibe.entity.Comment;
import com.streamvibe.entity.User;
import com.streamvibe.entity.Video;
import com.streamvibe.repository.CommentRepository;
import com.streamvibe.repository.UserRepository;
import com.streamvibe.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final VideoService videoService;
    
    @Transactional
    public Comment createComment(@NonNull Long userId, @NonNull Long videoId, String content, Long parentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("视频不存在"));
        
        Comment comment = new Comment();
        comment.setCommentId(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        comment.setUser(user);
        comment.setVideo(video);
        comment.setContent(content);
        comment.setContentLength(content.length());
        
        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("父评论不存在"));
            comment.setParent(parent);
            comment.setType(Comment.CommentType.reply);
            comment.setRootId(parent.getRootId() != null ? parent.getRootId() : parent.getId());
            
            // 更新父评论的回复数
            parent.setRepliesCount(parent.getRepliesCount() + 1);
            commentRepository.save(parent);
        }
        
        Comment saved = commentRepository.save(comment);
        
        // 更新视频评论数
        videoService.updateCommentsCount(videoId, 1);
        
        return saved;
    }
    
    public Page<Comment> getCommentsByVideo(@NonNull Long videoId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findByVideoIdAndIsDeletedFalseOrderByCreatedAtDesc(videoId, pageable);
    }
    
    public Page<Comment> getCommentsByUser(@NonNull Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId, pageable);
    }
    
    public List<Comment> getHotComments(Long videoId) {
        return commentRepository.findByVideoIdAndParentIsNullAndIsDeletedFalseOrderByLikesCountDescCreatedAtDesc(videoId);
    }
    
    public List<Comment> getReplies(Long parentId) {
        return commentRepository.findByParentIdOrderByCreatedAtAsc(parentId);
    }
    
    @Transactional
    public void deleteComment(@NonNull Long commentId, @NonNull Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此评论");
        }
        
        comment.setIsDeleted(true);
        comment.setContent("此评论已删除");
        commentRepository.save(comment);
        
        // 更新视频评论数
        videoService.updateCommentsCount(Objects.requireNonNull(comment.getVideo()).getId(), -1);
    }
    
    @Transactional
    public void updateLikeCount(@NonNull Long commentId, int delta) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        comment.setLikesCount(Math.max(0, comment.getLikesCount() + delta));
        commentRepository.save(comment);
    }
    
    public Comment getCommentById(@NonNull Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
    }
}
