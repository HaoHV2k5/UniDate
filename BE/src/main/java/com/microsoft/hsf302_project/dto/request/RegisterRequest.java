package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
public class RegisterRequest {
    @NotBlank(message="USERNAME_NOT_BLANK")
    private String username;

    @Email(message="EMAIL_INVALID")
    private String email;

    @NotBlank(message="PASSWORD_NOT_BLANK")
    @Size(min=6, message="PASSWORD_INVALID")
    private String password;

    @NotBlank(message="FULLNAME_NOT_BLANK")
    private String fullName;

    private String phone;
    private String gender;
}
