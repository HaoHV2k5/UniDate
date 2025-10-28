package com.microsoft.hsf302_project.service.impl;

import com.microsoft.hsf302_project.dto.request.IntrospectRequest;
import com.microsoft.hsf302_project.dto.request.LoginRequest;
import com.microsoft.hsf302_project.dto.request.RefreshRequest;
import com.microsoft.hsf302_project.dto.request.RegisterRequest;
import com.microsoft.hsf302_project.dto.response.IntrospectResponse;
import com.microsoft.hsf302_project.dto.response.LoginResponse;
import com.microsoft.hsf302_project.dto.response.RefreshResponse;
import com.microsoft.hsf302_project.dto.response.UserDetailResponse;
import com.microsoft.hsf302_project.entity.Users;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repository.UsersRepo;
import com.microsoft.hsf302_project.service.AuthService;
import com.microsoft.hsf302_project.service.JwtService;
import com.microsoft.hsf302_project.service.OtpService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UsersRepo usersRepo;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    // THÊM: dùng JWT cho Users
    private final JwtService jwtService;

    @Override
    public Long register(RegisterRequest req) {
        if (usersRepo.existsByUsername(req.getUsername())) throw new AppException(ErrorCode.USER_EXISTED);
        if (req.getEmail() != null && usersRepo.existsByEmail(req.getEmail())) throw new AppException(ErrorCode.ACCOUNT_EXISTED);
        if (req.getPhone() != null && usersRepo.existsByPhone(req.getPhone())) throw new AppException(ErrorCode.USER_EXISTED);

        Users u = Users.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .phone(req.getPhone())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .gender(req.getGender())
                .isActive(false)
                .build();
        u = usersRepo.save(u);

        var otp = otpService.generate(u, (req.getEmail() != null) ? "email" : "sms");
        System.out.println("OTP for userId=" + u.getId() + " code=" + otp.getCode()); // demo

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
        var otp = otpService.generate(u, (u.getEmail() != null) ? "email" : "sms");
        System.out.println("RESEND OTP for userId=" + u.getId() + " code=" + otp.getCode());
    }

    // ====== Login / Introspect / Refresh cho Users ======
    @Override
    public LoginResponse login(LoginRequest request) {
        Users user = usersRepo.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean ok = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!ok) throw new AppException(ErrorCode.LOGIN_FAIL);

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new AppException(ErrorCode.OTP_NOT_VERIFY);
        }

        String access = jwtService.generateToken(user);         // overload Users
        String refresh = jwtService.generateRefreshToken(user); // overload Users

        // dựng tay DTO tránh lệ thuộc mapper
        UserDetailResponse detail = new UserDetailResponse();
        detail.setUsername(user.getUsername());
        detail.setPassword(null);   // KHÔNG lộ mật khẩu
        detail.setRole("USER");

        return LoginResponse.builder()
                .authenticated(true)
                .accessToken(access)
                .refreshToken(refresh)
                .user(detail)
                .build();
    }

    @Override
    public IntrospectResponse introspectToken(IntrospectRequest request) {
        boolean isValid = true;
        try {
            jwtService.verifyJwt(request.getToken());
        } catch (Exception e) {
            isValid = false;
        }
        return IntrospectResponse.builder().authenticated(isValid).build();
    }

    @Override
    public RefreshResponse refresh(RefreshRequest request) throws ParseException, JOSEException {
        SignedJWT signed = jwtService.verifyJwt(request.getRefreshToken());
        String username = signed.getJWTClaimsSet().getSubject();

        Users user = usersRepo.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String newAccess = jwtService.generateToken(user);
        String newRefresh = jwtService.generateRefreshToken(user);

        return RefreshResponse.builder()
                .token(newAccess)
                .refreshToken(newRefresh)
                .build();
    }
}
