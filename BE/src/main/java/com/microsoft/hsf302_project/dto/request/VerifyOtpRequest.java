package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "USERNAME_NOT_BLANK")
    @Email(message = "EMAIL_INVALID")
    private String username;

    @NotBlank(message = "OTP_INVALID")
    @Size(min = 6, max = 6, message = "OTP_INVALID")
    private String otp;
}
