package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.LockUserRequest;
import com.microsoft.hsf302_project.dto.request.UserRequest;
import com.microsoft.hsf302_project.dto.request.UserUpdateRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.CommentResponse;
import com.microsoft.hsf302_project.dto.response.LikeResponse;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/user/all")
    public ApiResponse<List<UserResponse>> getAllUsersForAdmin() {
        List<UserResponse> users = userService.getAllUsers();
        return ApiResponse.<List<UserResponse>>builder().data(users).message("Lấy danh sách user thành công").build();
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/user/{id}")
    public ApiResponse<UserResponse> getUserByIdForAdmin(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ApiResponse.<UserResponse>builder().data(user).message("Lấy user thành công").build();
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping()
    public ApiResponse<UserResponse> createUserByAdmin(@RequestBody @Valid UserRequest request) {
        UserResponse userResponse = userService.createUserByAdmin(request);
        return ApiResponse.<UserResponse>builder().data(userResponse).message("Tạo user thành công").build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUserByAdmin(@PathVariable Long id, @RequestBody @Valid UserUpdateRequest request) {
        UserResponse userResponse = userService.updateUserByAdmin(id, request);
        return ApiResponse.<UserResponse>builder().data(userResponse).message("Cập nhật user thành công").build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUserByAdmin(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder().message("Xóa user thành công").build();
    }

    // chỉnh trạng thái locked của user
    // khóa user lại cua admin
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PutMapping("/lock/{id}")
    public ApiResponse<String> lockUser(
            @PathVariable Long id,
            @RequestBody @Valid LockUserRequest request,
            Authentication authentication) {


        String adminUsername = authentication.getName();
        userService.lockUser(id, request, adminUsername);

        if (authentication == null) {
            throw new RuntimeException("Không xác thực được admin");
        }

        return ApiResponse.<String>builder()
                .data("Đã khóa tài khoản người dùng")
                .message("Admin: Khóa người dùng thành công")
                .build();
    }

    // mở khóa user cuar admin
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PutMapping("/unlock/{id}")
    public ApiResponse<String> unlockUser(
            @PathVariable Long id,
            Authentication authentication) {

        String adminUsername = authentication.getName();
        userService.unlockUser(id, adminUsername);
        if (authentication == null) {
            throw new RuntimeException("Không xác thực được admin");
        }

        return ApiResponse.<String>builder()
                .data("Đã mở khóa tài khoản người dùng")
                .message("Admin: Mở khóa người dùng thành công")
                .build();
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @GetMapping("/allComment")
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
    @DeleteMapping("/deleteComment/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        userService.deleteComment(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Xóa bình luận thành công")
                        .build()
        );
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @GetMapping("/allLike")
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
    @DeleteMapping("/deleteLike/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLike(@PathVariable Long id) {
        userService.deleteComment(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Xóa lượt thích thành công")
                        .build()
        );
    }
}
