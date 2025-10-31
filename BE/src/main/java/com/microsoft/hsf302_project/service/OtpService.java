package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.entity.UserOtp;
import com.microsoft.hsf302_project.enums.OtpType;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repo.UserOtpRepo;
import com.microsoft.hsf302_project.util.OtpUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final UserOtpRepo userOtpRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService; // Gửi email OTP

    private static final int EXPIRE_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    public String generateAndStoreRegisterOtp(User user) {
        String otp = OtpUtils.random6Digits();

        UserOtp entity = UserOtp.builder()
                .user(user)
                .otpHash(passwordEncoder.encode(otp))
                .type(OtpType.REGISTER)
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRE_MINUTES))
                .attempts(0)
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();
        userOtpRepo.save(entity);

        // Gửi email OTP HTML (Thymeleaf)
        emailService.sendOtpEmail(
                user.getEmail(),
                "UniDate - Mã xác thực OTP đăng ký",
                user.getUsername(),
                otp,
                EXPIRE_MINUTES
        );

        return otp;
    }

    public void verifyRegisterOtp(User user, String rawOtp) {
        UserOtp latest = userOtpRepo
                .findTopByUserAndTypeAndUsedFalseOrderByCreatedAtDesc(user, OtpType.REGISTER)
                .orElseThrow(() -> new AppException(ErrorCode.OTP_INVALID));

        if (latest.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
        if (latest.getAttempts() >= MAX_ATTEMPTS) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        boolean ok = passwordEncoder.matches(rawOtp, latest.getOtpHash());
        if (!ok) {
            latest.setAttempts(latest.getAttempts() + 1);
            userOtpRepo.save(latest);
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        latest.setUsed(true);
        userOtpRepo.save(latest);
    }

    public int getExpireSeconds() {
        return EXPIRE_MINUTES * 60;
    }
}
