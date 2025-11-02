package com.microsoft.hsf302_project.controller;


import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.microsoft.hsf302_project.dto.request.*;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.IntrospectResponse;
import com.microsoft.hsf302_project.dto.response.LoginResponse;
import com.microsoft.hsf302_project.dto.response.RefreshResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.service.AuthService;
import com.microsoft.hsf302_project.service.JwtService;
import com.microsoft.hsf302_project.service.OtpService;
import com.microsoft.hsf302_project.service.UserService;
import com.nimbusds.jose.JOSEException;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/auth")
public class AuthController {
    private final AuthService authService;
    private final  UserService userService;
    private final OtpService otpService;


    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse result = authService.login(request);
        return ApiResponse.<LoginResponse>builder().data(result).build();
    }

//    @PostMapping("/introspect")
//    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
//        IntrospectResponse result = authService.introspectToken(request);
//        return ApiResponse.<IntrospectResponse>builder().data(result).build();
//    }





    @PostMapping("/refresh")
    public ApiResponse<RefreshResponse> refreshToken(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        RefreshResponse refreshResponse = authService.refresh(request);
        return  ApiResponse.<RefreshResponse>builder().data(refreshResponse).build();
    }

    @PostMapping("/firebase")
    public ApiResponse<LoginResponse> verifyToken(@RequestBody Map<String, String> body) throws Exception {
        String idToken = body.get("token");
        LoginResponse response;
        try{
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            response = authService.handleGoogleLogin(decodedToken);
            return   ApiResponse.<LoginResponse>builder().data(response).build();
        }catch (Exception e){
            return   ApiResponse.<LoginResponse>builder().message("Tài khoản google login bị sai! hãy thử lại").build();
        }


    }


   // đăng kí tài khoản
    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @ModelAttribute  RegisterRequest request){

        User user = authService.registerUser(request);

        otpService.generateOtpCode(user);
        return ApiResponse.<Void>builder().message("Check your email for the OTP to finish signing up.").build();
    }















}
