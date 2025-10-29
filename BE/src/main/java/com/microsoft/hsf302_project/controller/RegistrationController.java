package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.RegisterRequest;
import com.microsoft.hsf302_project.dto.request.ResendOtpRequest;
import com.microsoft.hsf302_project.dto.request.VerifyOtpRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.RegisterResponse;
import com.microsoft.hsf302_project.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class RegistrationController {
    private final RegistrationService registrationService;

    @PostMapping("/register")
    public ApiResponse<RegisterResponse> register(@Valid @RequestBody RegisterRequest req) {
        var data = registrationService.register(req);
        return ApiResponse.<RegisterResponse>builder()
                .data(data).message("Đăng ký thành công. Vui lòng kiểm tra email để lấy OTP.")
                .build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<Void> resend(@Valid @RequestBody ResendOtpRequest req) {
        registrationService.resend(req);
        return ApiResponse.<Void>builder().message("Đã gửi lại OTP (DEV: kiểm tra console).").build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<Void> verify(@Valid @RequestBody VerifyOtpRequest req) {
        registrationService.verify(req);
        return ApiResponse.<Void>builder().message("Xác thực OTP thành công.").build();
    }
}
