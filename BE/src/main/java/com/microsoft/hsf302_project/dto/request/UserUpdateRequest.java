package com.microsoft.hsf302_project.dto.request;

import com.microsoft.hsf302_project.enums.Role;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String email;
    private Role role;
}
