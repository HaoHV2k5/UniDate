package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.SwipeRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.SwipeHistoryItemResponse;
import com.microsoft.hsf302_project.dto.response.SwipeResponse;
import com.microsoft.hsf302_project.enums.SwipeAction;
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

    @GetMapping("/history")
    public ApiResponse<Page<SwipeHistoryItemResponse>> history(Authentication authentication,
                                                               @RequestParam(required = false) SwipeAction action,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "20") int size) {
        var data = swipeService.history(authentication, action, page, size);
        return ApiResponse.<Page<SwipeHistoryItemResponse>>builder()
                .data(data).message("Lịch sử swipe.")
                .build();
    }
}
