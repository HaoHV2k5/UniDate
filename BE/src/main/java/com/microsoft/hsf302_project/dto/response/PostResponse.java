package com.microsoft.hsf302_project.dto.response;

import com.microsoft.hsf302_project.enums.PostStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {

    private String content;
    private String title;
    private List<String> imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse user;
    private Boolean isPrivate;
    private PostStatus status;


}
