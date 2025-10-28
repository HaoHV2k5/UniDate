package com.microsoft.hsf302_project.service.impl;

import com.microsoft.hsf302_project.entity.OTP;
import com.microsoft.hsf302_project.entity.Users;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repository.OtpRepo;
import com.microsoft.hsf302_project.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpRepo otpRepo;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    @Transactional
    public OTP generate(Users user, String channel) {
        // 1) Vô hiệu hóa mọi OTP còn hiệu lực của user để tránh xung đột
        otpRepo.invalidateActiveForUser(user, LocalDateTime.now());

        // 2) Sinh OTP mới (String 6 chữ số, giữ được số 0 đầu)
        String code = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

        OTP otp = OTP.builder()
                .user(user)
                .channel(channel)
                .code(code)
                .expiredAt(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();

        return otpRepo.save(otp);
    }

    @Override
    @Transactional
    public void verify(Users user, String code) {
        // Chuẩn hóa input: bỏ khoảng trắng, yêu cầu đúng 6 chữ số
        if (code == null) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
        String normalized = code.trim();
        if (!normalized.matches("^\\d{6}$")) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        // Tìm OTP hợp lệ (đúng user + đúng code + chưa dùng + còn hạn)
        OTP otp = otpRepo
                .findTopByUserAndCodeAndIsUsedFalseAndExpiredAtAfterOrderByCreatedAtDesc(
                        user, normalized, LocalDateTime.now())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_INVALID));

        // Đánh dấu đã dùng
        otp.setIsUsed(true);
        otpRepo.save(otp);
    }
}
