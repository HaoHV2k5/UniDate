package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.service.FriendService;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.microsoft.hsf302_project.dto.response.UserResponse;
import java.util.List;

@RestController
@RequestMapping("/api/friend")
@RequiredArgsConstructor
public class FriendController {
    private final FriendService friendService;

    @PostMapping("/request")
    public ApiResponse<Void> sendFriendRequest(Authentication authentication, @RequestParam String receiverUsername) {
        String sender = authentication.getName();
        friendService.sendFriendRequest(sender, receiverUsername);
        return ApiResponse.<Void>builder().message("Đã gửi lời mời kết bạn").build();
    }

    @PostMapping("/accept/{requestId}")
    public ApiResponse<Void> acceptFriendRequest(Authentication authentication, @PathVariable Long requestId) {
        String receiver = authentication.getName();
        friendService.acceptFriendRequest(receiver, requestId);
        return ApiResponse.<Void>builder().message("Đã chấp nhận lời mời kết bạn").build();
    }

    @PostMapping("/reject/{requestId}")
    public ApiResponse<Void> rejectFriendRequest(Authentication authentication, @PathVariable Long requestId) {
        String receiver = authentication.getName();
        friendService.rejectFriendRequest(receiver, requestId);
        return ApiResponse.<Void>builder().message("Đã từ chối lời mời kết bạn").build();
    }

  

    @GetMapping("/of/{username}")
    public ApiResponse<List<UserResponse>> getFriendsOfUser(@PathVariable String username) {
        List<UserResponse> friends = friendService.getFriendsByUsername(username);
        return ApiResponse.<List<UserResponse>>builder()
                .data(friends)
                .message("Danh sách bạn bè của user")
                .build();
    }

    @GetMapping("/requests/incoming")
    public ApiResponse<List<UserResponse>> getIncomingFriendRequests(Authentication authentication) {
        String username = authentication.getName();
        List<UserResponse> list = friendService.getIncomingFriendRequests(username);
        return ApiResponse.<List<UserResponse>>builder()
                .data(list)
                .message("Danh sách lời mời kết bạn tới bạn")
                .build();
    }
}
