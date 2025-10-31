package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.SwipeRequest;
import com.microsoft.hsf302_project.dto.response.*;
import com.microsoft.hsf302_project.service.SwipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/swipes")
public class SwipeController {
    private final SwipeService swipeService;

    @PostMapping
    public ApiResponse<SwipeResponse> swipe(Authentication authentication,
                                            @Valid @RequestBody SwipeRequest request) {
        var data = swipeService.swipe(authentication, request);
        return ApiResponse.<SwipeResponse>builder()
                .data(data).message("Thao tác swipe thành công.")
                .build();
    }

    // HỘP THƯ: những ai đã LIKE/DISLIKE mình (trạng thái cuối)
    @GetMapping("/inbox")
    public ApiResponse<Page<SwipeInboxItemResponse>> inbox(Authentication authentication,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size) {
        var data = swipeService.inbox(authentication, page, size);
        return ApiResponse.<Page<SwipeInboxItemResponse>>builder()
                .data(data).message("Hộp thư swipe (nhận).")
                .build();
    }

    // Lượt mình đã làm – vẫn giữ nếu sau này cần
    @GetMapping("/history")
    public ApiResponse<Page<SwipeHistoryItemResponse>> history(Authentication authentication,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "20") int size) {
        var data = swipeService.history(authentication, page, size);
        return ApiResponse.<Page<SwipeHistoryItemResponse>>builder()
                .data(data).message("Lịch sử swipe (đã thực hiện).")
                .build();
    }
}
