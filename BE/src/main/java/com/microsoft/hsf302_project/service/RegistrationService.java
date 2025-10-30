package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.RegisterRequest;
import com.microsoft.hsf302_project.dto.request.ResendOtpRequest;
import com.microsoft.hsf302_project.dto.request.VerifyOtpRequest;
import com.microsoft.hsf302_project.dto.response.RegisterResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repo.UserRepo;
import com.microsoft.hsf302_project.util.OtpUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;


@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @Value("${app.dev-mode:true}")
    private boolean devMode;

    public RegisterResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getEmail())) {
            throw new AppException(ErrorCode.ACCOUNT_EXISTED);
        }
        User user = User.builder()
                .username(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .role("USER")
                .verified(false)
                .build();
        userRepo.save(user);

        String otp = otpService.generateAndStoreRegisterOtp(user);

        return RegisterResponse.builder()
                .usernameMasked(OtpUtils.maskEmailLikeUsername(user.getUsername()))
                .expiresInSeconds(otpService.getExpireSeconds())
                .otpDev(devMode ? otp : null) // chỉ trả OTP trong DEV
                .build();
    }

    public void resend(ResendOtpRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        otpService.generateAndStoreRegisterOtp(user);
    }

    public void verify(VerifyOtpRequest req) {
        User user = userRepo.findByUsername(req.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        otpService.verifyRegisterOtp(user, req.getOtp());
        user.setVerified(true); // xác thực xong cho phép login
        userRepo.save(user);
    }
}
