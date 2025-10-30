package com.microsoft.hsf302_project.dto.response;

import com.microsoft.hsf302_project.enums.Gender;
import com.microsoft.hsf302_project.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String major;
    private String university;
    private String bio;
    private LocalDate birthDate;
    private Gender gender;
    private Role role;
    private boolean active;
}
