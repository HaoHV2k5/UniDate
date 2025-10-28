package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="like_history",
        uniqueConstraints = @UniqueConstraint(name="uk_swiper_target", columnNames={"swiper_id","target_id"}),
        indexes = @Index(name="idx_swiper_decided", columnList="swiper_id,decidedAt"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LikeHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="swiper_id", nullable=false)
    private Users swiper;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="target_id", nullable=false)
    private Users target;

    @Column(nullable=false) private String decision; // like / pass
    @Column(nullable=false) private LocalDateTime decidedAt = LocalDateTime.now();
}
