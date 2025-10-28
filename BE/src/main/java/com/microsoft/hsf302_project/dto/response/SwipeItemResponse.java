package com.microsoft.hsf302_project.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class SwipeItemResponse {
    private Long targetUserId;
    private String decision;        // like/pass
    private LocalDateTime decidedAt;
}
