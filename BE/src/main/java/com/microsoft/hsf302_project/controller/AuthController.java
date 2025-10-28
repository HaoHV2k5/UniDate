package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.IntrospectRequest;
import com.microsoft.hsf302_project.dto.request.LoginRequest;
import com.microsoft.hsf302_project.dto.request.RefreshRequest;
import com.microsoft.hsf302_project.dto.request.RegisterRequest;
import com.microsoft.hsf302_project.dto.request.VerifyOtpRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.IntrospectResponse;
import com.microsoft.hsf302_project.dto.response.LoginResponse;
import com.microsoft.hsf302_project.dto.response.RefreshResponse;
import com.microsoft.hsf302_project.service.AuthService;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ====== Nhóm USERS (đăng ký + OTP) ======
    @PostMapping("/users/register")
    public ApiResponse<Long> register(@Valid @RequestBody RegisterRequest req) {
        Long userId = authService.register(req);
        return ApiResponse.ok(userId); // FE dùng userId để verify OTP
    }

    @PostMapping("/users/verify-otp")
    public ApiResponse<String> verify(@Valid @RequestBody VerifyOtpRequest req) {
        authService.verifyOtp(req.getUserId(), req.getCode());
        return ApiResponse.ok("verified");
    }

    @PostMapping("/users/resend-otp")
    public ApiResponse<String> resend(@RequestParam Long userId) {
        authService.resendOtp(userId);
        return ApiResponse.ok("sent");
    }

    // ====== Nhóm AUTH (login / introspect / refresh) ======
    @PostMapping("/auth/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse result = authService.login(request);
        return ApiResponse.ok(result);
    }

    @PostMapping("/auth/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        IntrospectResponse result = authService.introspectToken(request);
        return ApiResponse.ok(result);
    }

    @PostMapping("/auth/refresh")
    public ApiResponse<RefreshResponse> refreshToken(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        RefreshResponse refreshResponse = authService.refresh(request);
        return ApiResponse.ok(refreshResponse);
    }
}
