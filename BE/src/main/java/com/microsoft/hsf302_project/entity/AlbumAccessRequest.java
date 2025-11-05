package com.microsoft.hsf302_project.entity;

import com.microsoft.hsf302_project.enums.AlbumAccessStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "album_access_requests", uniqueConstraints = @UniqueConstraint(columnNames = {"requester_id", "owner_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlbumAccessRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    private AlbumAccessStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
