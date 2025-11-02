package com.microsoft.hsf302_project.dto.request;

import lombok.Data;

@Data
public class UserRequest {
    private String username;
    private String password;
    private String confirmPassword;
    private String fullName;
    private String role;
}
