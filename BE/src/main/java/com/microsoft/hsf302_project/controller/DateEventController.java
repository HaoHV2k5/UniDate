package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.CreateDateEventRequest;
import com.microsoft.hsf302_project.dto.request.RespondDateEventRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.DateEventResponse;
import com.microsoft.hsf302_project.service.DateEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dates")
@RequiredArgsConstructor
public class DateEventController {

    private final DateEventService dateEventService;

    @PostMapping
    public ApiResponse<DateEventResponse> create(Authentication auth, @RequestBody CreateDateEventRequest req) {
        DateEventResponse data = dateEventService.create(auth.getName(), req);
        return ApiResponse.<DateEventResponse>builder()
                .data(data)
                .message("Tạo lịch hẹn thành công")
                .build();
    }

    @GetMapping
    public ApiResponse<List<DateEventResponse>> myEvents(Authentication auth) {
        List<DateEventResponse> data = dateEventService.myEvents(auth.getName());
        return ApiResponse.<List<DateEventResponse>>builder()
                .data(data)
                .message("Danh sách lịch hẹn của bạn")
                .build();
    }

    @PostMapping("/{id}/respond")
    public ApiResponse<DateEventResponse> respond(Authentication auth, @PathVariable Long id,
                                                  @RequestBody RespondDateEventRequest req) {
        DateEventResponse data = dateEventService.respond(auth.getName(), id, req);
        return ApiResponse.<DateEventResponse>builder()
                .data(data)
                .message(req.isAccept() ? "Đã chấp nhận" : "Đã từ chối")
                .build();
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<DateEventResponse> cancel(Authentication auth, @PathVariable Long id) {
        DateEventResponse data = dateEventService.cancel(auth.getName(), id);
        return ApiResponse.<DateEventResponse>builder()
                .data(data)
                .message("Đã hủy lịch")
                .build();
    }
}
