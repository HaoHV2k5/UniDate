package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.RegisterRequest;

public interface AuthService {
    Long register(RegisterRequest req);          // trả userId
    void verifyOtp(Long userId, String code);
    void resendOtp(Long userId);
}
