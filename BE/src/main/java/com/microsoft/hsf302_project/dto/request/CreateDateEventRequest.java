package com.microsoft.hsf302_project.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateDateEventRequest {
    private String title;          // bắt buộc
    private String description;    // optional
    private String location;       // bắt buộc
    private LocalDateTime startAt; // bắt buộc (ISO-8601)
    private LocalDateTime endAt;   // bắt buộc (ISO-8601)
    private String inviteeUsername;// bắt buộc
}
