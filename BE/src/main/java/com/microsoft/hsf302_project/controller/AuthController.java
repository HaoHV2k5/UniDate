package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.RegisterRequest;
import com.microsoft.hsf302_project.dto.request.VerifyOtpRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<?> register(@Valid @RequestBody RegisterRequest req){
        Long userId = authService.register(req);
        return ApiResponse.ok(userId); // FE dùng userId để verify OTP
    }

    @PostMapping("/verify-otp")
    public ApiResponse<?> verify(@Valid @RequestBody VerifyOtpRequest req){
        authService.verifyOtp(req.getUserId(), req.getCode());
        return ApiResponse.ok("verified");
    }

    @PostMapping("/resend-otp")
    public ApiResponse<?> resend(@RequestParam Long userId){
        authService.resendOtp(userId);
        return ApiResponse.ok("sent");
    }
}
