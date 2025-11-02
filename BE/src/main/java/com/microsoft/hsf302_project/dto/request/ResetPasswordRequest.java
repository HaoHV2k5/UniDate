package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ResetPasswordRequest {
    private String email;
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String newPassword;
    private String otp;
}