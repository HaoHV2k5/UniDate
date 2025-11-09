package com.microsoft.hsf302_project.dto.request;

import lombok.Data;

@Data
public class UserInterestRequest {
    private Long userId;
    private Long interestId;
}
