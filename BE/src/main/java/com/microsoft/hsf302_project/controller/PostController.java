package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.PostRequest;
<<<<<<< HEAD
import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.PostResponse;

import com.microsoft.hsf302_project.service.PostService;
import com.microsoft.hsf302_project.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
=======
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
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final UserService userService;
<<<<<<< HEAD
// tạo bài đăng
    @PostMapping
    public ApiResponse<PostResponse> createPost(@Valid Authentication authentication, @ModelAttribute PostRequest postRequest) {
        String usrName = authentication.getName();
=======

    @PostMapping
    public ApiResponse<PostResponse> createPost(Authentication authentication, @RequestBody PostRequest postRequest) {
        String usrName = authentication.name();
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84

        PostResponse post = postService.createPost(postRequest,usrName);
        return  ApiResponse.<PostResponse>builder()
                .data(post).message("đã tạo bài đăng thành công")
                .build();

    }

<<<<<<< HEAD
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
    // chỉ lấy nếu nó là visible và public
    @GetMapping("/user/{id}")
    public ApiResponse<Page<PostResponse>> getPostByUser( @PathVariable Long userId,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {

        Page<PostResponse> list = postService.getPostByUserId(userId,page,size);
        return ApiResponse.<Page<PostResponse>>builder()
                .data(list)
                .message("lấy danh sách tất cả bài đăng public của user thành công")
                .build();
    }




    // lấy bài đăng trên homepage
    @GetMapping
    public ApiResponse<List<PostResponse>> getPostHomepage(@RequestParam(required = false) Long lastId,
                                                      @RequestParam(defaultValue = "10") int size) {

        List<PostResponse> list = postService.getPostHomePage(lastId, size);
        return ApiResponse.<List<PostResponse>>builder()
                .data(list)
                .message("lấy danh sách tất cả bài đăng public thành công")
                .build();
    }


    // api giúp cho người dùng khi nhấn vào 1 avatar hay tên của người dùng khác
    // thì sẽ đc chuyển qua trang homepage của họ


    // ẩn bài đăng

    @PutMapping("/{id}/hidden")
    public ApiResponse<PostResponse> hiddenPost(@Valid  Authentication authentication, @PathVariable Long id) {
        String username = authentication.getName();
        PostResponse post = postService.hiddenPost(username,id);
        return  ApiResponse.<PostResponse>builder()
                .message("đã hidden bài đăng thành công")
                .data(post)
                .build();
    }

    // chuyển public sang private
    @PutMapping("/{id}/private")
    public ApiResponse<PostResponse> privatePost(@Valid  Authentication authentication, @PathVariable Long id) {
        String username = authentication.getName();
        PostResponse post = postService.hiddenPost(username,id);
        return  ApiResponse.<PostResponse>builder()
                .message("đã hidden bài đăng thành công")
                .data(post)
                .build();
    }

    // nếu đã match được với nhau thì có theer xem tin private và public





=======
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84
}
