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
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final OtpService otpService;
    private final MailService mailService;


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ApiResponse<List<UserResponse>> getAllUsersForAdmin() {
        List<UserResponse> users = userService.getAllUsers();
        return ApiResponse.<List<UserResponse>>builder().data(users).message("Lấy danh sách user thành công").build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{id}")
    public ApiResponse<UserResponse> getUserByIdForAdmin(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ApiResponse.<UserResponse>builder().data(user).message("Lấy user thành công").build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    public ApiResponse<UserResponse> createUserByAdmin(@RequestBody @Valid UserRequest request) {
        UserResponse userResponse = userService.createUserByAdmin(request);
        return ApiResponse.<UserResponse>builder().data(userResponse).message("Tạo user thành công").build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}")
    public ApiResponse<UserResponse> updateUserByAdmin(@PathVariable Long id, @RequestBody @Valid UserUpdateRequest request) {
        UserResponse userResponse = userService.updateUserByAdmin(id, request);
        return ApiResponse.<UserResponse>builder().data(userResponse).message("Cập nhật user thành công").build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{id}")
    public ApiResponse<Void> deleteUserByAdmin(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder().message("Xóa user thành công").build();
    }


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
