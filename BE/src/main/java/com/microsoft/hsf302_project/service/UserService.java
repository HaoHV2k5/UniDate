package com.microsoft.hsf302_project.service;



import com.microsoft.hsf302_project.dto.request.UserCreationRequest;
import com.microsoft.hsf302_project.dto.request.UserPasswordUpdateRequest;
import com.microsoft.hsf302_project.dto.request.UserProfileRequest;

import com.microsoft.hsf302_project.dto.request.UserUpdateRequest;

import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.enums.Role;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.UserMapper;

import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor

public class UserService {
    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    @Autowired
    private final UserMapper userMapper;

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

    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }

    public void deleteUser(Long id) {
        if (!userRepo.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepo.deleteById(id);
    }

    public UserResponse updatePassword(Long id, UserPasswordUpdateRequest request) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }

    public UserResponse createProfile(Long id, UserProfileRequest request) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setBirthDate(request.getBirthDate());
        user.setGender(request.getGender());
        user.setMajor(request.getMajor());
        user.setUniversity(request.getUniversity());
        user.setBio(request.getBio());
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }


    public UserResponse createUser(UserCreationRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setFullName(request.getFullName());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER); // ✅ mặc định USER
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }

    public UserResponse changeUserRole(Long id, Role role) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setRole(role);
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }

    public void lockUser(Long id) {
        User user =  userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setActive(false);
        userRepo.save(user);
    }
    public void unLockUser(Long id){
        User user =  userRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setActive(true);
        userRepo.save(user);
    }
}
