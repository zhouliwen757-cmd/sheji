package com.streamvibe.repository;

import com.streamvibe.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    Optional<Comment> findByCommentId(String commentId);
    
    Page<Comment> findByVideoIdAndIsDeletedFalseOrderByCreatedAtDesc(Long videoId, Pageable pageable);
    
    Page<Comment> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Comment> findByVideoIdAndParentIsNullAndIsDeletedFalseOrderByLikesCountDescCreatedAtDesc(Long videoId);
    
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user.id = :userId AND c.isDeleted = false")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.video.id = :videoId AND c.isDeleted = false")
    Long countByVideoId(@Param("videoId") Long videoId);
}
