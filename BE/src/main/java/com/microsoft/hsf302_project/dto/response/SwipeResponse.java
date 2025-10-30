package com.microsoft.hsf302_project.dto.response;

import com.microsoft.hsf302_project.enums.SwipeAction;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SwipeResponse {
    private Long id;
    private Long targetUserId;
    private SwipeAction action;
    private boolean matched; // để dành nếu triển khai Match
}
