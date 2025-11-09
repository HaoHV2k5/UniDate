package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(Long postId);
    Page<Comment> findByPostIdOrderByCreatedAtDesc(Long postId, Pageable pageable);
    Page<Comment> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

}
