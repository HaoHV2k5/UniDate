package com.microsoft.hsf302_project.dto.request;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String role;
}
