package com.microsoft.hsf302_project.dto.request;

import com.microsoft.hsf302_project.enums.Role;
import lombok.Data;

@Data
public class UserCreationRequest {
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String passwordHash;
    private Role role;
}
