package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "USERNAME_NOT_BLANK")
    @Email(message = "EMAIL_INVALID")
    private String username;

    @NotBlank(message = "PASSWORD_NOT_BLANK")
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String password;

    @NotBlank(message = "FULLNAME_NOT_BLANK")
    private String fullName;
}
