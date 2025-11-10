package com.microsoft.hsf302_project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private LocalDateTime createdAt;
    private Integer amount;
    private String status;
    private String packageName;
    private LocalDateTime premiumStart;
    private LocalDateTime premiumEnd;

}

