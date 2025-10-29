package com.microsoft.hsf302_project.service;


import com.microsoft.hsf302_project.dto.request.IntrospectRequest;
import com.microsoft.hsf302_project.dto.request.LoginRequest;
import com.microsoft.hsf302_project.dto.request.RefreshRequest;
import com.microsoft.hsf302_project.dto.response.IntrospectResponse;
import com.microsoft.hsf302_project.dto.response.LoginResponse;
import com.microsoft.hsf302_project.dto.response.RefreshResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.UserMapper;
import com.microsoft.hsf302_project.repo.UserRepo;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.text.ParseException;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepo userRepository;

    private final JwtService jwtService;
    private final UserMapper userMapper;



    public LoginResponse login(LoginRequest loginRequest) {


        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow( () -> new AppException(ErrorCode.USER_NOT_EXISTED));
        // Chặn đăng nhập nếu chưa xác thực OTP
        if (Boolean.FALSE.equals(user.getVerified())) {
            throw new AppException(ErrorCode.OTP_NOT_VERIFY);
        }

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        boolean auth = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if(!auth){
            throw  new AppException(ErrorCode.LOGIN_FAIL);
        }
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return LoginResponse.builder()
                .authenticated(true)
                .accessToken(token)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }



    public IntrospectResponse introspectToken(IntrospectRequest request){
        String token = request.getToken();
        boolean isValid = true;

        try {
            jwtService.verifyJwt(token);
        } catch (Exception e) {
            isValid = false;
        }
        return IntrospectResponse.builder().authenticated(isValid).build();

    }








    public RefreshResponse refresh(RefreshRequest request) throws ParseException, JOSEException {
        String refreshToken = request.getRefreshToken();
        SignedJWT signedJWT = null;
        try{
            signedJWT  = jwtService.verifyJwt(refreshToken);

        }catch (Exception e){
            throw  new AppException(ErrorCode.UNAUTHORIZED);
        }

        String userName = signedJWT.getJWTClaimsSet().getSubject();
        User user = userRepository.findByUsername(userName).orElseThrow(()  -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String token = jwtService.generateToken(user);
        String refresh = jwtService.generateRefreshToken(user);

        return RefreshResponse.builder().token(token).refreshToken(refresh).build();

    }


}