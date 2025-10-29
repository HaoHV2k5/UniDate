package com.microsoft.hsf302_project.dto.request;

import com.microsoft.hsf302_project.enums.SwipeAction;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SwipeRequest {
    @NotNull
    private Long targetUserId;

    @NotNull
    private SwipeAction action; // LIKE/DISLIKE
}
