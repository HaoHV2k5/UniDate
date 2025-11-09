package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.UserInterestResponse;
import com.microsoft.hsf302_project.service.UserInterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-interests")
@RequiredArgsConstructor
public class UserInterestController {

    private final UserInterestService userInterestService;

    // Lấy danh sách sở thích của 1 user
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<UserInterestResponse>>> getUserInterests(@PathVariable Long userId) {
        List<UserInterestResponse> list = userInterestService.getUserInterests(userId);
        return ResponseEntity.ok(
                ApiResponse.<List<UserInterestResponse>>builder()
                        .message("Lấy danh sách sở thích của người dùng thành công")
                        .data(list)
                        .build()
        );
    }

    // Thêm 1 sở thích cho user
    @PostMapping("/{userId}/{interestId}")
    public ResponseEntity<ApiResponse<UserInterestResponse>> addUserInterest(
            @PathVariable Long userId,
            @PathVariable Long interestId
    ) {
        UserInterestResponse added = userInterestService.addUserInterest(userId, interestId);
        return ResponseEntity.ok(
                ApiResponse.<UserInterestResponse>builder()
                        .message("Thêm sở thích cho người dùng thành công")
                        .data(added)
                        .build()
        );
    }

    // Xóa 1 sở thích cụ thể của user
    @DeleteMapping("/{userId}/{interestId}")
    public ResponseEntity<ApiResponse<Void>> removeUserInterest(
            @PathVariable Long userId,
            @PathVariable Long interestId
    ) {
        userInterestService.removeUserInterest(userId, interestId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Xóa sở thích của người dùng thành công")
                        .build()
        );
    }

    // Xóa tất cả sở thích của user
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeAllUserInterests(@PathVariable Long userId) {
        userInterestService.removeAllUserInterests(userId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Xóa tất cả sở thích của người dùng thành công")
                        .build()
        );
    }
}
