package com.microsoft.hsf302_project.dto.response;

import com.microsoft.hsf302_project.enums.SwipeAction;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SwipeHistoryItemResponse {
    private Long swipeId;
    private Long targetUserId;
    private String targetUsername;
    private String targetFullName;
    private SwipeAction action;
    private LocalDateTime createdAt;
}
