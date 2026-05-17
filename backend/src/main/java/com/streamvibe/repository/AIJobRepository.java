package com.streamvibe.repository;

import com.streamvibe.entity.AIJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIJobRepository extends JpaRepository<AIJob, Long> {
    
    Optional<AIJob> findByJobId(String jobId);
    
    Optional<AIJob> findByTaskId(String taskId);
    
    Page<AIJob> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    Page<AIJob> findByStatusOrderByCreatedAtDesc(AIJob.JobStatus status, Pageable pageable);
}
