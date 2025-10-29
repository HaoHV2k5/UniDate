package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostRequest {
    @NotNull
    @NotBlank(message = "TITLE_NOT_BLANK")
    @Size(min = 1, max = 50, message = "TITLE_LENGTH_NOT_VALID")
    private String title;
    @NotNull
    @NotBlank(message = "CONTENT_NOT_BLANK")
    private String content;
    private List<MultipartFile> image;
    private boolean isPrivate;
}
