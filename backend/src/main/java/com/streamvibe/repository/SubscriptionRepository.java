package com.streamvibe.repository;

import com.streamvibe.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    Optional<Subscription> findBySubscriberIdAndChannelId(Long subscriberId, Long channelId);
    
    boolean existsBySubscriberIdAndChannelId(Long subscriberId, Long channelId);
    
    Page<Subscription> findBySubscriberIdOrderByCreatedAtDesc(Long subscriberId, Pageable pageable);
    
    Page<Subscription> findByChannelIdOrderByCreatedAtDesc(Long channelId, Pageable pageable);
    
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.subscriber.id = :userId")
    Long countBySubscriberId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.channel.id = :userId")
    Long countByChannelId(@Param("userId") Long userId);
    
    void deleteBySubscriberIdAndChannelId(Long subscriberId, Long channelId);
}
