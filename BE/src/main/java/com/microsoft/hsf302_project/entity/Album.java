package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "albums")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Album {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "album_images", joinColumns = @JoinColumn(name = "album_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;
}
