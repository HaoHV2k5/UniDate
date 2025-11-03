package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.Like;
import com.microsoft.hsf302_project.entity.Post;
import com.microsoft.hsf302_project.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepo extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    int countByPostAndType(Post post, String type);
    
    Page<Like> findAllByUser(User user, Pageable  pageable);

    Page<Like> findAllByUserAndType(User user, String type, Pageable  pageable);

}
