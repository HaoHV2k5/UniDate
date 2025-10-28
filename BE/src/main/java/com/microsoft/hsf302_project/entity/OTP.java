package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "otp",
        indexes = {
                // DÙNG TÊN CỘT TRONG DB (snake_case), không dùng tên field camelCase
                @Index(name = "idx_otp_user_expired", columnList = "user_id, expired_at")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OTP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(nullable = false)
    private String channel; // "email" / "sms"

    @Column(nullable = false, length = 6)
    private String code;    // LUÔN String để không mất số 0 ở đầu

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
