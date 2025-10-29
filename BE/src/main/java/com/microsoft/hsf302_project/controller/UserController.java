package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.*;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import com.microsoft.hsf302_project.enums.Role;
import com.microsoft.hsf302_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Lấy danh sách tất cả người dùng
    @GetMapping("/all")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        List<UserResponse> resList = userService.getAllUsers();
        return ApiResponse.<List<UserResponse>>builder()
                .data(resList)
                .message("Lấy danh sách tất cả user thành công")
                .build();
    }

    // Lấy thông tin người dùng theo ID
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse res = userService.getUserById(id);
        return ApiResponse.<UserResponse>builder()
                .data(res)
                .message("Lấy thông tin người dùng thành công")
                .build();
    }

    // Cập nhật thông tin người dùng
    @PostMapping("/update/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        UserResponse res = userService.updateUser(id, request);
        return ApiResponse.<UserResponse>builder()
                .data(res)
                .message("Cập nhật người dùng thành công")
                .build();
    }

    // Xóa người dùng
    @PostMapping("/delete/{id}")
    public ApiResponse<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.<String>builder()
                .data("Xóa người dùng thành công")
                .message("Xóa người dùng thành công")
                .build();
    }

    // Cập nhật mật khẩu người dùng
    @PostMapping("/update-password/{id}")
    public ApiResponse<UserResponse> updatePassword(@PathVariable Long id, @RequestBody UserPasswordUpdateRequest request) {
        UserResponse res = userService.updatePassword(id, request);
        return ApiResponse.<UserResponse>builder()
                .data(res)
                .message("Cập nhật mật khẩu thành công")
                .build();
    }

    // tạo hoặc cập nhật hồ sơ người dùng
    @PostMapping("/create-profile/{id}")
    public ApiResponse<UserResponse> createProfile(@PathVariable Long id, @RequestBody UserProfileRequest request) {
        UserResponse res = userService.createProfile(id, request);
        return ApiResponse.<UserResponse>builder()
                .data(res)
                .message("Tạo hồ sơ người dùng thành công")
                .build();
    }

    //đổi role người dùng
    @PutMapping("/role/{id}")
    public ApiResponse<UserResponse> changeRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        UserResponse res = userService.changeUserRole(id, role);
        return ApiResponse.<UserResponse>builder()
                .data(res)
                .message("Thay đổi vai trò người dùng thành công")
                .build();
    }

    //tạo user
    @PostMapping
    public ApiResponse<UserResponse> createUser(@RequestBody UserCreationRequest request) {
        UserResponse res = userService.createUser(request);
        return ApiResponse.<UserResponse>builder()
                .data(res)
                .message("Admin: Tạo người dùng mới thành công")
                .build();
    }

<<<<<<< HEAD
    // chỉnh trạng thái active của user
=======
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84
    // khóa user lại cua admin
    @PutMapping("/lock/{id}")
    public ApiResponse<String> lockUser(@PathVariable Long id) {
        userService.lockUser(id);
        return ApiResponse.<String>builder()
                .data("Đã khóa tài khoản người dùng")
                .message("Admin: Khóa người dùng thành công")
                .build();
    }

    // mở khóa user cuar admin
    @PutMapping("/unlock/{id}")
    public ApiResponse<String> unlockUser(@PathVariable Long id) {
        userService.unLockUser(id);
        return ApiResponse.<String>builder()
                .data("Đã mở khóa tài khoản người dùng")
                .message("Admin: Mở khóa người dùng thành công")
                .build();
    }
}
