package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.PostRequest;
import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.PostResponse;

import com.microsoft.hsf302_project.service.PostService;
import com.microsoft.hsf302_project.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final UserService userService;
// tạo bài đăng
    @PostMapping
    public ApiResponse<PostResponse> createPost(@Valid Authentication authentication, @ModelAttribute PostRequest postRequest) {
        String usrName = authentication.getName();

        PostResponse post = postService.createPost(postRequest,usrName);
        return  ApiResponse.<PostResponse>builder()
                .data(post).message("đã tạo bài đăng thành công")
                .build();

    }

    // update bài đăng
    @PutMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(@Valid  Authentication authentication, @PathVariable Long id, @ModelAttribute PostUpdateRequest postRequest) {
        String username = authentication.getName();
        PostResponse post = postService.updatePost(postRequest,username,id);
        return  ApiResponse.<PostResponse>builder()
                .message("đã update bài đăng thành công")
                .data(post)
                .build();
    }
    
    // xóa bài đăng
    @DeleteMapping("/{id}/delete")
    public ApiResponse<Void> deletePost(Authentication authentication, @PathVariable Long id) {
        String username = authentication.getName();
        postService.deletePost(username,id);
        return ApiResponse.<Void>builder().message("Đã xóa bài đăng thành công").build();
    }

    // lấy tất cả bài đăng của 1 user cụ thể
    // get dựa vào usr id

    // lấy bài đăng trên homepage
// get all post

    // api giúp cho người dùng khi nhấn vào 1 avatar hay tên của người dùng khác
    // thì sẽ đc chuyển qua trang homepage của họ
    

}
