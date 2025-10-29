package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.PostRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.service.PostService;
import com.microsoft.hsf302_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final UserService userService;
// tạo bài đăng
    @PostMapping
    public ApiResponse<PostResponse> createPost(Authentication authentication, @RequestBody PostRequest postRequest) {
        String usrName = authentication.name();

        PostResponse post = postService.createPost(postRequest,usrName);
        return  ApiResponse.<PostResponse>builder()
                .data(post).message("đã tạo bài đăng thành công")
                .build();

    }

    // update bài đăng
    // xóa bài đăng

    // lấy tất cả bài đăng của 1 user cụ thể

    // lấy bài đăng trên homepage


    // api giúp cho người dùng khi nhấn vào 1 avatar hay tên của người dùng khác
    // thì sẽ đc chuyển qua trang homepage của họ
    

}
