package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.RequestAccessResponse;
import com.microsoft.hsf302_project.entity.Album;
import com.microsoft.hsf302_project.entity.AlbumAccessRequest;
import com.microsoft.hsf302_project.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
public class AlbumController {
    private final AlbumService albumService;

    // Upload ảnh vào album cá nhân
    @PostMapping("/upload")
    public ApiResponse<Album> upload(
            @RequestParam("userId") Long userId,
            @RequestParam("files") List<MultipartFile> files) {
        Album album = albumService.uploadImages(userId, files);
        return ApiResponse.<Album>builder()
                .data(album)
                .message("Upload ảnh thành công")
                .build();
    }

    // Xem album của user khác hoặc của mình (yêu cầu đã được duyệt hoặc là chủ album)
    @GetMapping("/{ownerId}")
    public ApiResponse<List<String>> viewAlbum(
            @PathVariable Long ownerId,
            @RequestParam("requesterId") Long requesterId) {
        List<String> images = albumService.viewAlbum(ownerId, requesterId);
        return ApiResponse.<List<String>>builder()
                .data(images)
                .message("Lấy album ảnh thành công")
                .build();
    }

    // Gửi yêu cầu xin xem album
    @PostMapping("/{ownerId}/request-access")
    public ApiResponse<RequestAccessResponse> requestAccess(
            @PathVariable Long ownerId,
            @RequestParam("requesterId") Long requesterId) {
        RequestAccessResponse request = albumService.requestAccess(ownerId, requesterId);
        return ApiResponse.<RequestAccessResponse>builder()
                .data(request)
                .message("Đã gửi yêu cầu xem album")
                .build();
    }

    // Chủ album duyệt yêu cầu
    @PostMapping("/requests/{requestId}/approve")
    public ApiResponse<RequestAccessResponse> approve(
            @PathVariable Long requestId,
            @RequestParam("ownerId") Long ownerId) {
        RequestAccessResponse request = albumService.approveRequest(requestId, ownerId);
        return ApiResponse.<RequestAccessResponse>builder()
                .data(request)
                .message("Đã chấp thuận yêu cầu xem album")
                .build();
    }

    // Chủ album từ chối yêu cầu
    @PostMapping("/requests/{requestId}/reject")
    public ApiResponse<Void> reject(
            @PathVariable Long requestId,
            @RequestParam("ownerId") Long ownerId) {
        albumService.rejectRequest(requestId, ownerId);
        return ApiResponse.<Void>builder()
                .message("Đã từ chối yêu cầu xem album")
                .build();
    }

    @GetMapping("/pending")
    public ApiResponse<Page<RequestAccessResponse>> getAccessRequest(Authentication authentication,
                                                                  @RequestParam(defaultValue = "10")int size,
                                                                  @RequestParam(defaultValue = "0") int page){
        String userName = authentication.getName();
        Page<RequestAccessResponse> list = albumService.getAlbumRequests(userName, page, size);
        return  ApiResponse.<Page<RequestAccessResponse>>builder()
                .data(list)
                .message("Đã lấy toàn bộ request album thành công")
                .build();
    }

    @GetMapping("/approved")

    public ApiResponse<Page<RequestAccessResponse>> getAccessRequestApproved(Authentication authentication,
                                                                     @RequestParam(defaultValue = "10")int size,
                                                                     @RequestParam(defaultValue = "0") int page){
        String userName = authentication.getName();
        Page<RequestAccessResponse> list = albumService.getAlbumRequestsApproved(userName, page, size);
        return  ApiResponse.<Page<RequestAccessResponse>>builder()
                .data(list)
                .message("Đã lấy toàn bộ request album approved thành công")
                .build();
    }



}
