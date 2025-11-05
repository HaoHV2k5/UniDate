package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.NotificationResponse;
import com.microsoft.hsf302_project.service.NotificationService;
import com.microsoft.hsf302_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ApiResponse<Page<NotificationResponse>> getMyNotifications(Authentication authentication, 
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        String username = authentication.getName();
        Long userId = userService.getUser(username).getId();
        Page<NotificationResponse> notis = notificationService.getNotificationsForUser(userId, page, size);
        return ApiResponse.<Page<NotificationResponse>>builder()
                .data(notis)
                .message("Lấy danh sách thông báo thành công")
                .build();
    }
    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Long userId = userService.getUser(username).getId();
        notificationService.markAsRead(id, userId);
        return ApiResponse.<Void>builder().message("Đánh dấu đã đọc thành công").build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Long userId = userService.getUser(username).getId();
        notificationService.deleteNotification(id, userId);
        return ApiResponse.<Void>builder().message("Xóa thông báo thành công").build();
    }
}
