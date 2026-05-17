package com.streamvibe.repository;

import com.streamvibe.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    Optional<Favorite> findByUserIdAndVideoId(Long userId, Long videoId);
    
    boolean existsByUserIdAndVideoId(Long userId, Long videoId);
    
    Page<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.video.id = :videoId")
    Long countByVideoId(@Param("videoId") Long videoId);
    
    void deleteByUserIdAndVideoId(Long userId, Long videoId);
}
