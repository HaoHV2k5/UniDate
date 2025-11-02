package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.ResendOtpRequest;
import com.microsoft.hsf302_project.dto.request.VerifyOtpRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.service.MailService;
import com.microsoft.hsf302_project.service.OtpService;
import com.microsoft.hsf302_project.service.UserService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class OtpController {
    private final UserService userService;
    private final OtpService otpService;
    private final MailService mailService;
    private  String LOGIN_URL = "http://localhost:5173/login.html";

    @PostMapping("/verify-otp")
    public ApiResponse<Void> verifyOtp(@RequestBody VerifyOtpRequest request){

        User user = userService.getUser(request.getEmail());
        boolean check = otpService.verifyOtpCode(user,request.getOtp());
        String message = check ? "Verification successful. Your account is now activated" : "Invalid or expired OTP";
        if(check){
            try {
                mailService.sendEmail(user.getEmail(), LOGIN_URL,user.getUsername());
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }

        return ApiResponse.<Void>builder().message(message).build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<Void> resendOtp(@RequestBody ResendOtpRequest request){
        User user = userService.getUser(request.getEmail());
        otpService.generateOtpCode(user);
        return ApiResponse.<Void>builder().message("A new OTP has been sent to your email.").build();

    }

}
