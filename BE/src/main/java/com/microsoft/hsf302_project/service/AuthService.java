package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.RegisterRequest;
import com.microsoft.hsf302_project.dto.request.LoginRequest;
import com.microsoft.hsf302_project.dto.request.IntrospectRequest;
import com.microsoft.hsf302_project.dto.request.RefreshRequest;
import com.microsoft.hsf302_project.dto.response.LoginResponse;
import com.microsoft.hsf302_project.dto.response.IntrospectResponse;
import com.microsoft.hsf302_project.dto.response.RefreshResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

/**
 * Hợp nhất cả 2 nhóm: đăng ký + OTP và login/JWT.
 * Giữ AuthService là interface để tương thích với cấu trúc hiện tại (đã có AuthServiceImpl).
 */
public interface AuthService {

    // ===== Nhóm USERS (đăng ký + OTP) =====
    Long register(RegisterRequest req);          // trả userId cho FE dùng verify OTP
    void verifyOtp(Long userId, String code);
    void resendOtp(Long userId);

    // ===== Nhóm AUTH (login / introspect / refresh) =====
    LoginResponse login(LoginRequest request);

    IntrospectResponse introspectToken(IntrospectRequest request);

    RefreshResponse refresh(RefreshRequest request) throws ParseException, JOSEException;
}
