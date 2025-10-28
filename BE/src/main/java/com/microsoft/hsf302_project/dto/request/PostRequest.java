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
    @NotBlank
    @Size(min = 1, max = 20)
    private String title;
    @NotNull
    @NotBlank
    private String content;
    private List<MultipartFile> image;
}
