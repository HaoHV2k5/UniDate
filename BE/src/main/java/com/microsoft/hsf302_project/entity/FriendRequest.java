package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "friend_requests", uniqueConstraints = @UniqueConstraint(columnNames = {"sender_id", "receiver_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }
}
