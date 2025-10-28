package com.microsoft.hsf302_project.service.impl;

import com.microsoft.hsf302_project.dto.request.RegisterRequest;
import com.microsoft.hsf302_project.entity.Users;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repository.UsersRepo;
import com.microsoft.hsf302_project.service.AuthService;
import com.microsoft.hsf302_project.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UsersRepo usersRepo;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @Override
    public Long register(RegisterRequest req) {
        if(usersRepo.existsByUsername(req.getUsername())) throw new AppException(ErrorCode.USER_EXISTED);
        if(req.getEmail()!=null && usersRepo.existsByEmail(req.getEmail())) throw new AppException(ErrorCode.ACCOUNT_EXISTED);
        if(req.getPhone()!=null && usersRepo.existsByPhone(req.getPhone())) throw new AppException(ErrorCode.USER_EXISTED);

        Users u = Users.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .phone(req.getPhone())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .gender(req.getGender())
                .isActive(false).build();
        u = usersRepo.save(u);

        var otp = otpService.generate(u, (req.getEmail()!=null) ? "email" : "sms");
        System.out.println("OTP for userId="+u.getId()+" code="+otp.getCode()); // demo

        return u.getId();
    }

    @Override
    public void verifyOtp(Long userId, String code) {
        Users u = usersRepo.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        otpService.verify(u, code);
        u.setIsActive(true);
        usersRepo.save(u);
    }

    @Override
    public void resendOtp(Long userId) {
        Users u = usersRepo.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        var otp = otpService.generate(u, (u.getEmail()!=null) ? "email" : "sms");
        System.out.println("RESEND OTP for userId="+u.getId()+" code="+otp.getCode());
    }
}
