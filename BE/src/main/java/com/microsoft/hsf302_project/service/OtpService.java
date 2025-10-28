package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.entity.OTP;
import com.microsoft.hsf302_project.entity.Users;

public interface OtpService {
    OTP generate(Users user, String channel);
    void verify(Users user, String code);
}
