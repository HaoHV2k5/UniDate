package com.microsoft.hsf302_project.dto.response;

import com.microsoft.hsf302_project.enums.SwipeAction;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SwipeInboxItemResponse {
    private Long swipeId;

    // Thông tin NGƯỜI ĐÃ TÁC ĐỘNG đến mình
    private Long sourceUserId;
    private String sourceUsername;
    private String sourceFullName;

    private SwipeAction action;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
