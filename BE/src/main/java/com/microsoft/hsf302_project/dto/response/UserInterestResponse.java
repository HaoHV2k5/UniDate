package com.microsoft.hsf302_project.dto.response;

import lombok.Data;

@Data
public class UserInterestResponse {
    private Long id;
    private Long userId;
    private Long interestId;
    private String interestName;
    private String category;
}
