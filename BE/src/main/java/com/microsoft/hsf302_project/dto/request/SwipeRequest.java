package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
public class SwipeRequest {
    @NotNull private Long targetUserId;
    @NotNull private Boolean like;   // true=like, false=pass
}
