package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResendOtpRequest {
    @NotBlank(message = "USERNAME_NOT_BLANK")
    @Email(message = "EMAIL_INVALID")
    private String username;
}
