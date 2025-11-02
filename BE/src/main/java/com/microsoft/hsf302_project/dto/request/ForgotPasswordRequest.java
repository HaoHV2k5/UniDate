package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ForgotPasswordRequest {
    @NotEmpty(message = "EMAIL_NOT_BLANK")
    @Email(message = "EMAIL_INVALID")
    @NotNull(message = "EMAIL_NOT_BLANK")
    @NotBlank(message = "EMAIL_NOT_BLANK")
    private String email;
}
