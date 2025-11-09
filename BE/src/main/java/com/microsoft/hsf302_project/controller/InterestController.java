package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.InterestRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.InterestResponse;
import com.microsoft.hsf302_project.service.InterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;

    // Tạo mới Interest
    @PostMapping
    public ApiResponse<InterestResponse> createInterest(@RequestBody InterestRequest request) {
        InterestResponse created = interestService.createInterest(request);
        return ApiResponse.<InterestResponse>builder()
                .message("Tạo sở thích mới thành công")
                .data(created)
                .build();
    }

    // Lấy tất cả Interest
    @GetMapping
    public ApiResponse<List<InterestResponse>> getAllInterests() {
        List<InterestResponse> list = interestService.getAllInterests();
        return ApiResponse.<List<InterestResponse>>builder()
                .message("Lấy danh sách tất cả sở thích thành công")
                .data(list)
                .build();
    }

    // Lấy Interest theo ID
    @GetMapping("/{id}")
    public ApiResponse<InterestResponse> getInterestById(@PathVariable Long id) {
        InterestResponse response = interestService.getInterestById(id);
        return ApiResponse.<InterestResponse>builder()
                .message("Lấy thông tin sở thích theo ID thành công")
                .data(response)
                .build();
    }

    // Lấy Interest theo category
    @GetMapping("/category/{category}")
    public ApiResponse<List<InterestResponse>> getByCategory(@PathVariable String category) {
        List<InterestResponse> list = interestService.getByCategory(category);
        return ApiResponse.<List<InterestResponse>>builder()
                .message("Lấy danh sách sở thích theo danh mục thành công")
                .data(list)
                .build();
    }

    // Cập nhật Interest
    @PutMapping("/{id}")
    public ApiResponse<InterestResponse> updateInterest(
            @PathVariable Long id,
            @RequestBody InterestRequest request
    ) {
        InterestResponse updated = interestService.updateInterest(id, request);
        return ApiResponse.<InterestResponse>builder()
                .message("Cập nhật sở thích thành công")
                .data(updated)
                .build();
    }

    // Xóa Interest
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInterest(@PathVariable Long id) {
        interestService.deleteInterest(id);
        return ApiResponse.<Void>builder()
                .message("Xóa sở thích thành công")
                .build();
    }
}
