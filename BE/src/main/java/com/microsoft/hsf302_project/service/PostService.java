package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.PostRequest;
import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.Post;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.enums.PostStatus;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.PostMapper;
import com.microsoft.hsf302_project.repo.PostRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepo postRepo;
    private final CloudinaryService cloudinaryService;
    private final PostMapper postMapper;
private final UserRepo userRepo;


    public PostResponse createPost(PostRequest request, String usrname) {
        User user = userRepo.findByUsername(usrname).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .user(user)
                .build();

        List<String> imgUrls = new ArrayList<>();
        if(request.getImage() != null && !request.getImage().isEmpty() ) {
            for (MultipartFile file : request.getImage()) {
                String url  = cloudinaryService.upload(file);
                imgUrls.add(url);
            }
        }
        post.setImageUrl(imgUrls);
        postRepo.save(post);

        return  postMapper.toPostResponse(post);

    }
    // update post
    public PostResponse updatePost(PostUpdateRequest request, String usrname,Long postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        if (!post.getUser().getUsername().equals(usrname)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        postMapper.updatePost(request, post);
        postRepo.save(post);

        return  postMapper.toPostResponse(post);
    }

    public void deletePost(String username, Long postId){
        Post post = postRepo.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        if(!post.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        postRepo.delete(post);

    }
// lấy tất cả bài đăng visible vaf public => homepage
    public List<PostResponse> getPostHomePage(Long lastId, int size){
        Pageable pageable = PageRequest.of(0, size);



        List<Post> list = postRepo.getPostHomePage(PostStatus.VISIBLE,false,lastId,pageable);
        List<PostResponse> postResponses = postMapper.toListPostResponse(list);
        return postResponses;
    }


}
