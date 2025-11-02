package com.microsoft.hsf302_project.service;



import com.microsoft.hsf302_project.dto.request.*;

import com.microsoft.hsf302_project.dto.response.UserListResponse;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.UserMapper;

import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor

public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final  OtpService otpService;

    public List<UserResponse> getAllUsers() {
        return userRepo.findAll().stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }



    public void deleteUser(Long id) {
        if (!userRepo.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepo.deleteById(id);
    }

//    public UserResponse updatePassword(Long id, UserPasswordUpdateRequest request) {
//        User user = userRepo.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
//        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
//            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
//        }
//        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
//        userRepo.save(user);
//        return userMapper.toUserResponse(user);
//    }

    public UserResponse createProfile(Long id, UserProfileRequest request) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }
    public User getUser(String email){
        User user = userRepo.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));


        return user;

    }

    public UserResponse getUserByUsername(String username){
        User user = userRepo.getUserByUsername(username);
        return userMapper.toUserResponse(user);
    }

    public boolean resetPassword(ResetPasswordRequest request, User user) {
        boolean check  = true;
        boolean checkOtp = otpService.verifyOtpCode(user, request.getOtp());
        if(!checkOtp){

            throw  new AppException(ErrorCode.OTP_INVALID);

        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        return check;

    }


    public Long getIdByUsername(String username) {
        User user = userRepo.getUserByUsername(username);
        if(user == null){
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return user.getId();
    }

    public UserListResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUserFromRequest(request, user);
        User savedUser = userRepo.save(user);
        return userMapper.toUserListResponse(savedUser);
    }

    public void updatePassword(User user,String password){
        user.setPassword(passwordEncoder.encode(password));
        userRepo.save(user);
    }
}
