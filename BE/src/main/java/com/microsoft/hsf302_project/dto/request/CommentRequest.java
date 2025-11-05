package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class CommentRequest {
    @NotBlank
    private String content;
    @NotNull
    private Long postId;
    private List<MultipartFile> images;
}
