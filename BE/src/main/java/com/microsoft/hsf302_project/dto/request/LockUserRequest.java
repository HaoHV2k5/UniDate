package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LockUserRequest {
    @NotBlank(message = "Lý do ban không được để trống")
    private String reason;

    private LocalDateTime lockedUntil; // null = ban vĩnh viễn
}
