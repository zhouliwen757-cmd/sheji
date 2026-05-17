package com.streamvibe.repository;

import com.streamvibe.entity.WatchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Long> {
    
    Optional<WatchHistory> findByUserIdAndVideoId(Long userId, Long videoId);
    
    Page<WatchHistory> findByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);
    
    void deleteByUserIdAndVideoId(Long userId, Long videoId);
}
