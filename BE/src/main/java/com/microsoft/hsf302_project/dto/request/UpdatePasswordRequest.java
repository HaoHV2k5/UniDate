package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePasswordRequest {
    @NotEmpty(message = "PASSWORD_NOT_BLANK")
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String password;
}
