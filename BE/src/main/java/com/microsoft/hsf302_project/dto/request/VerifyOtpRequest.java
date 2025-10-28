package com.microsoft.hsf302_project.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
public class VerifyOtpRequest {
    @NotNull
    private Long userId;
    @NotBlank private String code;
}
