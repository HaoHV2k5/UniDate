package com.microsoft.hsf302_project.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private String userName;
    private String avatar;
    private List<String> imageUrls;
}
