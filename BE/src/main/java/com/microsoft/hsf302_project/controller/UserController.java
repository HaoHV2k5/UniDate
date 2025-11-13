package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.*;
import com.microsoft.hsf302_project.dto.response.*;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.service.GeminiService;
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
    private final GeminiService geminiService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        UserResponse userDetail = userService.getUserByUsername(username);
        return ApiResponse.<UserResponse>builder()
                .data(userDetail)
                .message("User information retrieved successfully")
                .build();
    }

    // @GetMapping("/profile/{username}")
    // public ApiResponse<UserResponse> getProfile(@PathVariable String username) {
    //     UserResponse response = userService.getUserByUsername(username);
    //     return ApiResponse.<UserResponse>builder().data(response).message("Lấy thông tin cá nhân thành công").build();
    // }

    @GetMapping("/profile/{username}")
    public ApiResponse<UserProfileResponse> getUserProfileExtended(@PathVariable String username, Authentication authentication) {
        String viewing = authentication.getName();
        UserProfileResponse profileResponse = userService.getUserProfileWithPosts(viewing,username);
        return ApiResponse.<UserProfileResponse>builder().data(profileResponse).message("Thông tin cá nhân và bài viết").build();
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

    public ApiResponse<UserResponse> updateUser(Authentication authentication,
                                                    @RequestBody @Valid UpdateUserRequest request) {
        String name = authentication.getName();
        Long id = userService.getIdByUsername(name);
        UserResponse updatedUser = userService.updateUser(id, request);
        return ApiResponse.<UserResponse>builder()
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


//    @GetMapping
//    public ApiResponse<List<UserResponse>> getAllUser(){
//        List<UserResponse> list = userService.getAllUser();
//        return  ApiResponse.<List<UserResponse>>builder()
//                .message("đã lấy tất cả user")
//                .data(list)
//                .build();
//    }

    // API: Gợi ý bạn bè cho người dùng hiện tại
    @GetMapping("/suggest")
    public ApiResponse<List<UserResponse>> suggestUsers(Authentication authentication,
                                                        @RequestParam(defaultValue = "3") int size) {
        String username = authentication.getName();
        UserResponse user = userService.getUserByUsername(username);
        List<UserResponse> suggested = userService.suggestUsers(username, size);

        List<UserResponse> response = geminiService.suggestMatch(user, suggested);

        return ApiResponse.<List<UserResponse>>builder()
                .message("suggest successfully")
                .data(response)
                .build();
    }



    // Thêm DTO cho bio
    @PatchMapping("/bio")
    public ApiResponse<UserResponse> updateBio(Authentication authentication, @RequestBody UpdateBioRequest req) {
        String name = authentication.getName();
        Long id = userService.getIdByUsername(name);
        String bio = req.getBio();
        if (bio == null || bio.trim().isEmpty()) {
            throw new AppException(ErrorCode.UNCATEGORIZED);
        }
        UserResponse updated = userService.updateBio(id, bio);
        return ApiResponse.<UserResponse>builder()
                .data(updated)
                .message("Cập nhật bio thành công")
                .build();
    }


    @PutMapping("/{id}/location")
    public ResponseEntity<UserResponse> updateUserLocation(
            @PathVariable Long id,
            @RequestBody LocationUpdateRequest request) {

        UserResponse updated = userService.updateUserLocation(id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/nearby")
    public ResponseEntity<List<NearbyUserResponse>> findNearby(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") double radiusKm) {
        List<NearbyUserResponse> list = userService.findUsersWithinRadiusKm(id, radiusKm);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/autocomplete")
    public ApiResponse<List<UserResponse>> autocomplete(@RequestParam String keyword) {
        List<UserResponse> response = userService.autocompleteByName(keyword);
        return ApiResponse.<List<UserResponse>>builder()
                .data(response)
                .message("Autocomplete successfully")
                .build();
    }


    @GetMapping("/search")
    public ApiResponse<List<UserResponse>> searchStudents(@RequestParam String name) {
        List<UserResponse> res = userService.searchByName(name);
        return ApiResponse.<List<UserResponse>>builder()
                .data(res)
                .message("Search successfully")
                .build();
    }
}
