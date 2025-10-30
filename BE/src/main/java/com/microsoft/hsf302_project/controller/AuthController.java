package com.microsoft.hsf302_project.controller;


import com.microsoft.hsf302_project.dto.request.IntrospectRequest;
import com.microsoft.hsf302_project.dto.request.LoginRequest;
import com.microsoft.hsf302_project.dto.request.RefreshRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.IntrospectResponse;
import com.microsoft.hsf302_project.dto.response.LoginResponse;
import com.microsoft.hsf302_project.dto.response.RefreshResponse;
import com.microsoft.hsf302_project.service.AuthService;
import com.microsoft.hsf302_project.service.JwtService;
import com.microsoft.hsf302_project.service.UserService;
import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;



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









}
