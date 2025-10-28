package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.SwipeRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.service.SwipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/swipes")
@RequiredArgsConstructor
public class SwipeController {
    private final SwipeService swipeService;

    // tạm thời nhận userId qua header; sau sẽ lấy từ JWT
    @PostMapping
    public ApiResponse<?> swipe(@RequestHeader("X-USER-ID") Long swiperId,
                                @Valid @RequestBody SwipeRequest req){
        swipeService.swipe(swiperId, req);
        return ApiResponse.ok("ok");
    }

    @GetMapping("/history")
    public ApiResponse<?> history(@RequestHeader("X-USER-ID") Long swiperId,
                                  @RequestParam(defaultValue="0") int page,
                                  @RequestParam(defaultValue="10") int size){
        return ApiResponse.ok(swipeService.history(swiperId, page, size));
    }
}
