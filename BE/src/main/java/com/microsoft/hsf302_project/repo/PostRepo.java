package com.microsoft.hsf302_project.repo;

<<<<<<< HEAD
import com.microsoft.hsf302_project.dto.response.PostResponse;
import com.microsoft.hsf302_project.entity.Post;
import com.microsoft.hsf302_project.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface PostRepo extends JpaRepository<Post,Long> {

    List<Post> findAllPostByStatus(PostStatus status);

    List<Post> findAllPostByStatusAndIsPrivate(PostStatus status, Boolean isPrivate);


        @Query("""
                 SELECT p FROM Post p
                        WHERE (:lastId IS NULL OR p.id < :lastId)
                          AND p.status = :status
                          AND p.isPrivate = :isPrivate
                        ORDER BY p.id DESC

        """)

    List<Post> getPostHomePage(@Param("status") PostStatus status,
                               @Param("isPrivate") Boolean isPrivate,
                               @Param("lastId") Long lastId,
                               Pageable pageable);


    @Query("""
        SELECT p FROM Post p
        WHERE p.user.id = :userId
          AND p.isPrivate = false
          AND p.status = :status
        ORDER BY p.id DESC
        """)
    Page<Post> findPublicVisiblePostsByUserId(
            @Param("userId") Long userId,
            @Param("status") PostStatus status,
            Pageable pageable);

=======
import com.microsoft.hsf302_project.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepo extends JpaRepository<Post,Long> {
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84
}
