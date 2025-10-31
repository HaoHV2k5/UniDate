package com.microsoft.hsf302_project.dto.request;

import com.microsoft.hsf302_project.enums.Gender;
import com.microsoft.hsf302_project.enums.Role;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileRequest {
    private String fullName;
    private String email;
    private Gender gender;
    private LocalDate birthDate;
    private String major;
    private String university;
    private String bio;
}
