package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.*;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.ResetPasswordResponse;
import com.microsoft.hsf302_project.dto.response.UserListResponse;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.service.MailService;
import com.microsoft.hsf302_project.service.OtpService;
import com.microsoft.hsf302_project.service.UserService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final OtpService otpService;
    private final MailService mailService;


//    @GetMapping("/all")
//    public ResponseEntity<List<UserResponse>> getAllUsers() {
//        return ResponseEntity.ok(userService.getAllUsers());
//    }
//
//
//    @GetMapping("/{id}")
//    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
//        return ResponseEntity.ok(userService.getUserById(id));
//    }
//    @PostMapping("/update/{id}")
//    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
//        return ResponseEntity.ok(userService.updateUser(id, request));
//    }

//    @PostMapping("/delete/{id}")
//    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
//        userService.deleteUser(id);
//        return ResponseEntity.ok("Xóa người dùng thành công");
//    }

//    @PostMapping("/update-password/{id}")
//    public ResponseEntity<UserResponse> updatePassword(@PathVariable Long id, @RequestBody UserPasswordUpdateRequest request) {
//        return ResponseEntity.ok(userService.updatePassword(id, request));
//    }

//    @PostMapping("/create-profile/{id}")
//    public ResponseEntity<UserResponse> createProfile(@PathVariable Long id, @RequestBody UserProfileRequest request) {
//        return ResponseEntity.ok(userService.createProfile(id, request));
//    }






    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        UserResponse userDetail = userService.getUserByUsername(username);
        return ApiResponse.<UserResponse>builder()
                .data(userDetail)
                .message("User information retrieved successfully")
                .build();
    }


    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request){
        User user = userService.getUser(request.getEmail());
        otpService.generateOtpCode(user);
        return ApiResponse.<String>builder().message("Đã gửi otp để xác thực").data(user.getEmail()).build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<ResetPasswordResponse> handleResetPassword(@RequestBody @Valid ResetPasswordRequest request){
        User user = userService.getUser(request.getEmail());

        boolean result  = userService.resetPassword(request, user);
        try {
            mailService.sendRegisterNotice(user.getEmail(), user.getFullName());
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        return ApiResponse.<ResetPasswordResponse>builder().message("Reset Password thành công")
                .data(ResetPasswordResponse.builder().success(result).build()).build();
    }



    @PutMapping("/update")

    public ApiResponse<UserListResponse> updateUser(Authentication authentication,
                                                    @RequestBody @Valid UpdateUserRequest request) {
        String name = authentication.getName();
        Long id = userService.getIdByUsername(name);
        UserListResponse updatedUser = userService.updateUser(id, request);
        return ApiResponse.<UserListResponse>builder()
                .data(updatedUser)
                .message("User updated successfully")
                .build();
    }

    @PutMapping("/change/password")
    public ApiResponse<Boolean> updatePasswordUser(Authentication authentication,@RequestBody @Valid  UpdatePasswordRequest request) {
        String  username = authentication.getName();
        User user = userService.getUser(username);
        userService.updatePassword(user,request.getPassword());
        return ApiResponse.<Boolean>builder().message("Password updated successfully").build();
    }




}
