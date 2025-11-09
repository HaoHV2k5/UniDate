package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String message;

    @Builder.Default
    private boolean isRead = false;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trigger_by_id")
    private User triggerBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        FRIEND_REQUEST, FRIEND_ACCEPT, FRIEND_REJECT, ALBUM_ACCESS_REQUEST, POST_LIKE,POST_DISLIKE, POST_COMMENT,APPROVE_REQUEST_ACCESS,REJECT_REQUEST_ACCESS, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED
    }
}
