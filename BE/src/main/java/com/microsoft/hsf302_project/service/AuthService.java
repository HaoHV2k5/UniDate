package com.microsoft.hsf302_project.service;


import com.google.firebase.auth.FirebaseToken;
import com.microsoft.hsf302_project.dto.request.IntrospectRequest;
import com.microsoft.hsf302_project.dto.request.LoginRequest;
import com.microsoft.hsf302_project.dto.request.RefreshRequest;
import com.microsoft.hsf302_project.dto.request.RegisterRequest;
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
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.HashSet;
import java.util.function.Supplier;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepo userRepo;

    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final CloudinaryService cloudinaryService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;



    public LoginResponse login(LoginRequest loginRequest) {


        User user = userRepo.findByUsername(loginRequest.getUsername())
                .orElseThrow( () -> new AppException(ErrorCode.USER_NOT_EXISTED));

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



//    public IntrospectResponse introspectToken(IntrospectRequest request){
//        String token = request.getToken();
//        boolean isValid = true;
//
//        try {
//            jwtService.verifyJwt(token);
//        } catch (Exception e) {
//            isValid = false;
//        }
//        return IntrospectResponse.builder().authenticated(isValid).build();
//
//    }








    public RefreshResponse refresh(RefreshRequest request) throws ParseException, JOSEException {
        String refreshToken = request.getRefreshToken();
        SignedJWT signedJWT = null;
        try{
            signedJWT  = jwtService.verifyJwt(refreshToken);

        }catch (Exception e){
            throw  new AppException(ErrorCode.UNAUTHORIZED);
        }

        String userName = signedJWT.getJWTClaimsSet().getSubject();
        User user = userRepo.findByUsername(userName).orElseThrow(()  -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String token = jwtService.generateToken(user);
        String refresh = jwtService.generateRefreshToken(user);

        return RefreshResponse.builder().token(token).refreshToken(refresh).build();

    }

     public LoginResponse handleGoogleLogin(FirebaseToken acc){
        String email =  acc.getEmail();

        boolean check = userRepo.existsByEmail(email);


        if(check){
            User user = userRepo.findUserByEmail(email);
            String password = user.getPassword();
            if(!password.equals("abc")){
                throw  new AppException(ErrorCode.EMAIL_EXISTED);
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
            User newUser = User.builder()
                    .email(email)
                    .password("abc")
                    .fullName(acc.getName())
                    .avatar(acc.getPicture())
                    .build();
            userRepo.save(newUser);

         String token = jwtService.generateToken(newUser);
         String refreshToken = jwtService.generateRefreshToken(newUser);
         return LoginResponse.builder()
                 .authenticated(true)
                 .accessToken(token)
                 .refreshToken(refreshToken)
                 .user(userMapper.toUserResponse(newUser))
                 .build();

     }




    public User registerUser(RegisterRequest request) {
        User user = processRegister(
                request.getEmail(),
                request.getPassword(),
                request.getConfirmPassword(),
                () -> userMapper.toUser(request)
        );
        String avatar = cloudinaryService.upload(request.getImage());
        user.setAvatar(avatar);
        userRepo.save(user);
        return user;
    }


    @Transactional
    public User processRegister(String email,
                                String password,
                                String confirmPassword,
                                Supplier<User> userSupplier) {

        if (userRepo.existsByEmail(email)) {
            log.warn("email already exists");

            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (!password.equals(confirmPassword)) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }
        User user = userSupplier.get();
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        userRepo.save(user);

        return user;
    }

    @Transactional
    public User processRegisterByAdmin(String email,
                                       String password,
                                       String confirmPassword,
                                       Supplier<User> userSupplier) {

        if (userRepo.existsByEmail(email)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (!password.equals(confirmPassword)) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        User user = userSupplier.get();
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setVerified(true); // Admin tạo user thì tự động verify

        user.setRole("USER");
        userRepo.save(user);

        return user;
    }







}