package com.microsoft.hsf302_project.dto.response;

import com.microsoft.hsf302_project.entity.DateEvent;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DateEventResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String status;

    private Long creatorId;
    private String creatorUsername;
    private String creatorFullName;

    private Long inviteeId;
    private String inviteeUsername;
    private String inviteeFullName;

    public static DateEventResponse of(DateEvent e) {
        return DateEventResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .location(e.getLocation())
                .startAt(e.getStartAt())
                .endAt(e.getEndAt())
                .status(e.getStatus().name())
                .creatorId(e.getCreator().getId())
                .creatorUsername(e.getCreator().getUsername())
                .creatorFullName(e.getCreator().getFullName())
                .inviteeId(e.getInvitee().getId())
                .inviteeUsername(e.getInvitee().getUsername())
                .inviteeFullName(e.getInvitee().getFullName())
                .build();
    }
}
