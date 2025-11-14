package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.request.CommentRequest;
import com.microsoft.hsf302_project.dto.request.PostRequest;
import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.LikeResponse;
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.dto.response.CommentResponse;

import com.microsoft.hsf302_project.service.PostService;
import com.microsoft.hsf302_project.service.UserService;
import com.microsoft.hsf302_project.service.CommentService;
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
    private final CommentService commentService;
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
    public ApiResponse<Page<PostResponse>> getPostByUser( @PathVariable("id") Long userId,
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
// ng dung comment
    @PostMapping("/{id}/comment")
    public ApiResponse<CommentResponse> commentPost(@Valid Authentication authentication, @PathVariable Long id, @ModelAttribute CommentRequest request) {
        String username = authentication.getName();
        request.setPostId(id);
        CommentResponse response = commentService.createComment(request, username);
        return ApiResponse.<CommentResponse>builder()
                .message("Đã comment thành công")
                .data(response)
                .build();
    }

    // lay danh sach comment theo bai dang
    @GetMapping("/{id}/comments")
    public ApiResponse<Page<CommentResponse>> getPostComments(@PathVariable Long id, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<CommentResponse> comments = commentService.getCommentsByPostId(id, page, size);
        return ApiResponse.<Page<CommentResponse>>builder()
            .data(comments)
            .message("Lấy danh sách comment theo post thành công")
            .build();
    }

    // lay toan bo commnet cho admin
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/comments/admin")
    public ApiResponse<Page<CommentResponse>> getAllCommentsForAdmin(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<CommentResponse> comments = commentService.getAllCommentsForAdmin(page, size);
        return ApiResponse.<Page<CommentResponse>>builder()
            .data(comments)
            .message("Admin lấy toàn bộ comment thành công")
            .build();
    }
    // lấy comment dựa vào user id
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @GetMapping("/user/{userId}/comments")
    public ApiResponse<Page<CommentResponse>> getUserComments(@PathVariable Long userId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<CommentResponse> comments = commentService.getCommentsByUserId(userId, page, size);
        return ApiResponse.<Page<CommentResponse>>builder()
            .data(comments)
            .message("Lấy toàn bộ comment theo userId thành công")
            .build();
    }

    //lay comment cua chinh minh
    @GetMapping("/user/comments")
    public ApiResponse<Page<CommentResponse>> getOwnerComments(Authentication authentication, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        String username = authentication.getName();
        User user = userService.getUser(username);
        Page<CommentResponse> comments = commentService.getCommentsByUserId(user.getId(), page, size);
        return ApiResponse.<Page<CommentResponse>>builder()
                .data(comments)
                .message("Lấy toàn bộ comment của chính mình thành công")
                .build();
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public ApiResponse<Void> deleteCommentInPost(@PathVariable Long postId, @PathVariable Long commentId, Authentication authentication) {
        String username = authentication.getName();
        commentService.deleteCommentInPost(postId, commentId, username);
        return ApiResponse.<Void>builder()
            .message("Chủ bài đăng đã xóa comment thành công")
            .build();
    }

    @DeleteMapping("/comments/{commentId}/owner")
    public ApiResponse<Void> deleteOwnComment(@PathVariable Long commentId, Authentication authentication) {
        String username = authentication.getName();
        commentService.deleteCommentByOwner(commentId, username);
        return ApiResponse.<Void>builder()
            .message("Đã xóa comment của mình thành công")
            .build();
    }

    @PutMapping("/comments/{commentId}/owner")
    public ApiResponse<CommentResponse> updateOwnComment(@PathVariable Long commentId, @ModelAttribute CommentRequest request, Authentication authentication) {
        String username = authentication.getName();
        CommentResponse response = commentService.updateComment(commentId, request, username);
        return ApiResponse.<CommentResponse>builder()
            .data(response)
            .message("Update comment thành công")
            .build();
    }

    @GetMapping("/user/{userId}/likes")
    public ApiResponse<Page<LikeResponse>> getLikeHistoryByUserId(@PathVariable Long userId, @RequestParam(defaultValue = "10") int size,
                                                        @RequestParam(defaultValue = "0") int page) {
        Page<LikeResponse> result = postService.getTypeLikesByUserId(userId, page, size);
        return ApiResponse.<Page<LikeResponse>>builder()
                .message("đã lấy toàn bộ lịch sử like theo userId")
                .data(result)
                .build();
    }
    @GetMapping("/user/{userId}/dislikes")
    public ApiResponse<Page<LikeResponse>> getDislikeHistoryByUserId(@PathVariable Long userId, @RequestParam(defaultValue = "10") int size,
                                                        @RequestParam(defaultValue = "0") int page) {
        Page<LikeResponse> result = postService.getTypeDislikesByUserId(userId, page, size);
        return ApiResponse.<Page<LikeResponse>>builder()
                .message("đã lấy toàn bộ lịch sử dislike theo userId")
                .data(result)
                .build();
    }






}
