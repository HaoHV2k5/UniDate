package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.*;
import com.microsoft.hsf302_project.dto.response.*;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
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


    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUser(){
        List<UserResponse> list = userService.getAllUser();
        return  ApiResponse.<List<UserResponse>>builder()
                .message("đã lấy tất cả user")
                .data(list)
                .build();
    }

    // API: Gợi ý bạn bè cho người dùng hiện tại
    @GetMapping("/suggest")
    public ApiResponse<List<UserResponse>> suggestUsers(Authentication authentication,
                                                        @RequestParam(defaultValue = "3") int size) {
        String username = authentication.getName();
        List<UserResponse> suggested = userService.suggestUsers(username, size);

        ApiResponse<List<UserResponse>> response = new ApiResponse<>();
        response.setCode(1000);
        response.setMessage("Gợi ý " + suggested.size() + " người phù hợp nhất");
        response.setData(suggested);
        return response;
    }

    // chỉnh trạng thái locked của user
    // khóa user lại cua admin
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PutMapping("/admin/lock/{id}")
    public ApiResponse<String> lockUser(
            @PathVariable Long id,
            @RequestBody @Valid LockUserRequest request,
            Authentication authentication) {

        String adminUsername = authentication.getName();
        userService.lockUser(id, request, adminUsername);

        return ApiResponse.<String>builder()
                .data("Đã khóa tài khoản người dùng")
                .message("Admin: Khóa người dùng thành công")
                .build();
    }

    // mở khóa user cuar admin
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PutMapping("/admin/unlock/{id}")
    public ApiResponse<String> unlockUser(
            @PathVariable Long id,
            Authentication authentication) {

        String adminUsername = authentication.getName();
        userService.unlockUser(id, adminUsername);

        return ApiResponse.<String>builder()
                .data("Đã mở khóa tài khoản người dùng")
                .message("Admin: Mở khóa người dùng thành công")
                .build();
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @GetMapping("/admin/allComment")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getAllComments() {
        List<CommentResponse> comments = userService.getAllComments();
        return ResponseEntity.ok(
                ApiResponse.<List<CommentResponse>>builder()
                        .message("Lấy danh sách bình luận thành công")
                        .data(comments)
                        .build()
        );
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @DeleteMapping("/admin/deleteComment/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        userService.deleteComment(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Xóa bình luận thành công")
                        .build()
        );
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @GetMapping("/admin/allLike")
    public ResponseEntity<ApiResponse<List<LikeResponse>>> getAllLikes() {
        List<LikeResponse> likes = userService.getAllLikes();
        return ResponseEntity.ok(
                ApiResponse.<List<LikeResponse>>builder()
                        .message("Lấy danh sách lượt thích thành công")
                        .data(likes)
                        .build()
        );
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @DeleteMapping("/admin/deleteLike/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLike(@PathVariable Long id) {
        userService.deleteComment(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Xóa bình luận thành công")
                        .build()
        );
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


}
