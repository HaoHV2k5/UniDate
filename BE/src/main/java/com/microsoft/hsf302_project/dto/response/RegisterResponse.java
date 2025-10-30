package com.microsoft.hsf302_project.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponse {
    private String usernameMasked;
    private int expiresInSeconds;
    // DEV only: để trống khi lên prod
    private String otpDev;
}
