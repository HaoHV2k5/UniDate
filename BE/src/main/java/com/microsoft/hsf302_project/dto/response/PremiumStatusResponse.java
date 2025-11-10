package com.microsoft.hsf302_project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PremiumStatusResponse {
    private boolean active;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String packageName;


   
}

