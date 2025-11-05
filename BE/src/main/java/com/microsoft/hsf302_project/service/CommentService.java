package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.CommentRequest;
import com.microsoft.hsf302_project.dto.response.CommentResponse;
import com.microsoft.hsf302_project.entity.Comment;
import com.microsoft.hsf302_project.entity.Post;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repo.PostRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import com.microsoft.hsf302_project.repository.CommentRepository;
import com.microsoft.hsf302_project.mapper.CommentMapper;
import com.microsoft.hsf302_project.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepo postRepo;
    private final UserRepo userRepo;
    private final CommentMapper commentMapper;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;

    public CommentResponse createComment(CommentRequest request, String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Post post = postRepo.findById(request.getPostId())
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        List<String> imgUrls = request.getImages() == null ? List.of() : request.getImages().stream()
                .filter(file -> !file.isEmpty())
                .map(cloudinaryService::upload)
                .toList();
        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .post(post)
                .imageUrls(imgUrls)
                .build();
        Comment saved = commentRepository.save(comment);
        User owner = post.getUser();
        notificationService.notifyPostComment(owner,user,"đã comment vào bài đăng");
        return commentMapper.toCommentResponse(saved);
    }

    public Page<CommentResponse> getCommentsByPostId(Long postId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable);
        return commentPage.map(commentMapper::toCommentResponse);
    }
    public Page<CommentResponse> getAllCommentsForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findAll(pageable);
        return commentPage.map(commentMapper::toCommentResponse);
    }
    public Page<CommentResponse> getCommentsByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
        return commentPage.map(commentMapper::toCommentResponse);
    }

    @Transactional
    public void deleteCommentInPost(Long postId, Long commentId, String ownerUsername) {
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        if (!post.getUser().getUsername().equals(ownerUsername)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!comment.getPost().getId().equals(postId)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public void deleteCommentByOwner(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!comment.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentRequest request, String username) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!comment.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        // Chỉ update content và imageUrls
        comment.setContent(request.getContent());
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<String> imgUrls = request.getImages().stream()
                    .filter(file -> !file.isEmpty())
                    .map(cloudinaryService::upload)
                    .toList();
            comment.setImageUrls(imgUrls);
        }
        Comment saved = commentRepository.save(comment);
        return commentMapper.toCommentResponse(saved);
    }
}
