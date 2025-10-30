package com.microsoft.hsf302_project.entity;

import com.microsoft.hsf302_project.enums.PostStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

<<<<<<< HEAD
    @Column(nullable = false,columnDefinition = "NVARCHAR(2048)")
    private String content;

    @Column(nullable = false,columnDefinition = "NVARCHAR(50)")
=======
    @Column(nullable = false, length = 2048)
    private String content;

    @Column(nullable = false, length = 20)
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84
    private String title;

    private List<String> imageUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    private Boolean isPrivate = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private PostStatus status = PostStatus.VISIBLE;
<<<<<<< HEAD

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
=======
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84
}
