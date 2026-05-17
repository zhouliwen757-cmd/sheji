package com.streamvibe.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    private String commentId;
    private Long videoId;
    private String videoTitle;
    private String videoThumbnail;
    private Long userId;
    private String username;
    private String userNickname;
    private String userAvatar;
    private Long parentId;
    private Long rootId;
    private String content;
    private Integer likesCount;
    private Integer repliesCount;
    private String type;
    private Boolean isTop;
    private Boolean isHot;
    private LocalDateTime createdAt;
}
