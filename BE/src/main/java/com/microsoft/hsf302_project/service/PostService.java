package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.PostRequest;
import com.microsoft.hsf302_project.dto.request.PostUpdateRequest;
import com.microsoft.hsf302_project.dto.response.LikeResponse;
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.Post;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.entity.Like;
import com.microsoft.hsf302_project.enums.PostStatus;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.mapper.LikeMapper;
import com.microsoft.hsf302_project.mapper.PostMapper;
import com.microsoft.hsf302_project.repo.PostRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import com.microsoft.hsf302_project.repo.LikeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
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
    private final LikeRepo likeRepo;
    private final LikeMapper likeMapper;


    public PostResponse createPost(PostRequest request, String usrname) {
        User user = userRepo.findByUsername(usrname).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .user(user)
                .isPrivate(request.isPrivate())
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
        PostResponse response = postMapper.toPostResponse(post);
        response.setLikeCount(likeRepo.countByPostAndType(post, "LIKE"));
        response.setDislikeCount(likeRepo.countByPostAndType(post, "DISLIKE"));
        return response;

    }
    // update post
    public PostResponse updatePost(PostUpdateRequest request, String usrname,Long postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        if (!post.getUser().getUsername().equals(usrname)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        postMapper.updatePost(request, post);
        postRepo.save(post);
        PostResponse response = postMapper.toPostResponse(post);
        response.setLikeCount(likeRepo.countByPostAndType(post, "LIKE"));
        response.setDislikeCount(likeRepo.countByPostAndType(post, "DISLIKE"));
        return response;
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
        for (int i = 0; i < list.size(); i++) {
            postResponses.get(i).setLikeCount(likeRepo.countByPostAndType(list.get(i), "LIKE"));
            postResponses.get(i).setDislikeCount(likeRepo.countByPostAndType(list.get(i), "DISLIKE"));
        }
        return postResponses;
    }

    public PostResponse hiddenPost(String username, Long postId){
        Post post = postRepo.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        if(!post.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        post.setStatus(PostStatus.HIDDEN);
        postRepo.save(post);
        PostResponse response = postMapper.toPostResponse(post);
        response.setLikeCount(likeRepo.countByPostAndType(post, "LIKE"));
        response.setDislikeCount(likeRepo.countByPostAndType(post, "DISLIKE"));
        return response;
    }

    public PostResponse privatePost(String username, Long postId){
        Post post = postRepo.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        if(!post.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        post.setIsPrivate(true);
        postRepo.save(post);
        PostResponse response = postMapper.toPostResponse(post);
        response.setLikeCount(likeRepo.countByPostAndType(post, "LIKE"));
        response.setDislikeCount(likeRepo.countByPostAndType(post, "DISLIKE"));
        return response;
    }

    public Page<PostResponse> getPostByUserId(Long userId,int size, int page) {
        Pageable pageable = PageRequest.of(page,size, Sort.by("id").descending());
        Page<Post> pagePost = postRepo.findPublicVisiblePostsByUserId(userId,PostStatus.VISIBLE,pageable);
        return pagePost.map(postMapper::toPostResponse);
    }

    public void likeOrDislikePost(Long postId, User user, String type) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        Like like = likeRepo.findByUserAndPost(user, post).orElse(null);
        if (like == null) {
            like = Like.builder()
                    .user(user)
                    .post(post)
                    .type(type)
                    .build();
        } else {
            like.setType(type);
        }
        likeRepo.save(like);
    }

    public int countLike(Long postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        return likeRepo.countByPostAndType(post, "LIKE");
    }

    public int countDislike(Long postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        return likeRepo.countByPostAndType(post, "DISLIKE");
    }
    // lấy hết lịch sử like và dislike
    public Page<LikeResponse> getReactions(String username, int page, int size) {
        User user = userRepo.getUserByUsername(username);
        Pageable pageable = PageRequest.of(page,size, Sort.by("createdAt").descending());
        Page<Like> likes = likeRepo.findAllByUser(user, pageable);
        return likes.map(likeMapper::toLikeResponse);
    }

    // lay lich su like

    public Page<LikeResponse> getTypeLikes(String username, int page, int size) {
        User user = userRepo.getUserByUsername(username);
        Pageable pageable = PageRequest.of(page,size, Sort.by("createdAt").descending());

        Page<Like> likes = likeRepo.findAllByUserAndType(user,"LIKE", pageable);
        return likes.map(likeMapper::toLikeResponse);
    }

    // lay lich su dislike
    public Page<LikeResponse> getTypeDislikes(String username, int page, int size) {
        User user = userRepo.getUserByUsername(username);
        Pageable pageable = PageRequest.of(page,size, Sort.by("createdAt").descending());
        Page<Like> likes = likeRepo.findAllByUserAndType(user,"DISLIKE", pageable);
        return likes.map(likeMapper::toLikeResponse);
    }

    public Page<LikeResponse> getAllReactionsByAdmin(int page, int size){
        Pageable pageable = PageRequest.of(page,size, Sort.by("createdAt").descending());
        Page<Like> result = likeRepo.findAll(pageable);
        return result.map(likeMapper::toLikeResponse);
    }


}
