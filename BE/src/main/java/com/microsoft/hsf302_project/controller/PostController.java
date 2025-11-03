package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.PostRequest;
import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.LikeResponse;
import com.microsoft.hsf302_project.dto.response.PostResponse;

import com.microsoft.hsf302_project.service.PostService;
import com.microsoft.hsf302_project.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.microsoft.hsf302_project.entity.User;

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
        PostResponse post = postService.privatePost(username,id);
        return  ApiResponse.<PostResponse>builder()
                .message("đã hidden bài đăng thành công")
                .data(post)
                .build();
    }

    // nếu đã match được với nhau thì có theer xem tin private và public



// hanh dong like
    @PostMapping("/{id}/like")
    public ApiResponse<Void> likePost(Authentication authentication, @PathVariable Long id) {
        String username = authentication.getName();
        User user = userService.getUser(username);
        postService.likeOrDislikePost(id, user, "LIKE");
        return ApiResponse.<Void>builder().message("Đã like bài viết").build();
    }
// hanh dong dislike
    @PostMapping("/{id}/dislike")
    public ApiResponse<Void> dislikePost(Authentication authentication, @PathVariable Long id) {
        String username = authentication.getName();
        User user = userService.getUser(username);
        postService.likeOrDislikePost(id, user, "DISLIKE");
        return ApiResponse.<Void>builder().message("Đã dislike bài viết").build();
    }

// lay danh sach toan bo like/dislike cua 1 user
    @GetMapping("/reactions/history")
    public ApiResponse<Page<LikeResponse>>  reactionHistory(Authentication authentication, @RequestParam(defaultValue = "10") int size,
                                      @RequestParam(defaultValue = "0") int page
                                      ){
        String username = authentication.getName();
        Page<LikeResponse> result = postService.getReactions(username,page,size);
        return ApiResponse.<Page<LikeResponse>>builder()
                .message("đã lấy toàn bộ lịch sử like/ dislike của 1 người dùng")
                .data(result)
                .build();
    }

    // lay danh sach like cua 1 user

    @GetMapping("/likes/history")
    public ApiResponse<Page<LikeResponse>>  getLikeHistory(Authentication authentication, @RequestParam(defaultValue = "10") int size,
                                                        @RequestParam(defaultValue = "0") int page
    ){
        String username = authentication.getName();
        Page<LikeResponse> result = postService.getTypeLikes(username,page,size);
        return ApiResponse.<Page<LikeResponse>>builder()
                .message("đã lấy toàn bộ lịch sử like của 1 người dùng")
                .data(result)
                .build();
    }

    // lay danh sach dislike cua 1 user
    @GetMapping("/dislikes/history")
    public ApiResponse<Page<LikeResponse>>  getDislikeHistory(Authentication authentication, @RequestParam(defaultValue = "10") int size,
                                                           @RequestParam(defaultValue = "0") int page
    ){
        String username = authentication.getName();
        Page<LikeResponse> result = postService.getTypeDislikes(username,page,size);
        return ApiResponse.<Page<LikeResponse>>builder()
                .message("đã lấy toàn bộ lịch sử dislike của người dùng")
                .data(result)
                .build();
    }

    //admin lay tat ca reactions trong he thong
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/reactions/history/admin")
    public ApiResponse<Page<LikeResponse>> getAllReactionByAdmin(@RequestParam(defaultValue = "10")int size,

                                                                 @RequestParam(defaultValue = "0")  int page
                                                                 ){
        Page<LikeResponse> result = postService.getAllReactionsByAdmin(page,size);
        return  ApiResponse.<Page<LikeResponse>>builder()
                .message("đã lấy tất cả bài đăng bài đăng")
                .data(result)

                .build();


    }




}
