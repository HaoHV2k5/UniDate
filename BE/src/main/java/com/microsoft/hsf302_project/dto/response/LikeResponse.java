package com.microsoft.hsf302_project.dto.response;

import com.microsoft.hsf302_project.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LikeResponse {
    private Long id;
    private String title; // chuyen tu ten bai dang
    private String ownerPost; // chuyen tu ten user
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
