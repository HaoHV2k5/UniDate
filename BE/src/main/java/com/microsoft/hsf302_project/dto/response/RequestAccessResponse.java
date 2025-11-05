package com.microsoft.hsf302_project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestAccessResponse {
    private Long id;
    private UserResponse requester;
    private String status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
