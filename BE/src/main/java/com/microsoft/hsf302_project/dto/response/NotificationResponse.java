package com.microsoft.hsf302_project.dto.response;


import com.microsoft.hsf302_project.enums.NotificationType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long triggerById;
    private String triggerByName;
}
