package com.streamvibe.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_jobs")
public class AIJob {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "job_id", nullable = false, unique = true, length = 64)
    private String jobId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private JobType type;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JobStatus status = JobStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String prompt;
    
    @Column(name = "negative_prompt", columnDefinition = "TEXT")
    private String negativePrompt;
    
    @Column(columnDefinition = "JSON")
    private String params;
    
    @Column(name = "result_url", length = 500)
    private String resultUrl;
    
    @Column(name = "result_data", columnDefinition = "JSON")
    private String resultData;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    private Integer progress = 0;
    
    @Column(name = "task_id", length = 100)
    private String taskId;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    public enum JobType {
        video, image, audio
    }
    
    public enum JobStatus {
        PENDING, RUNNING, SUCCESS, FAILED
    }
}
