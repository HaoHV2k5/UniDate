package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users",

        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email")
        })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)

    private String username;
    @Column(nullable = false)

    private String password;
    @Column(nullable = false,columnDefinition = "NVARCHAR(100)")
    private String fullName;
    @Column(nullable = false)

    private String role;
    @Column(nullable = false)

    private String email;

    private String avatar;
    @Builder.Default
    private boolean isVerified = false;

    //lock user
    @Builder.Default
    private boolean locked = false;

    @Column(name = "locked_reason",nullable = true)
    private String lockedReason;

    @Column(name = "locked_date",nullable = true)
    private LocalDateTime lockedDate;

    @Column(name = "locked_until",nullable = true)
    private LocalDateTime lockedUntil;

    private String phone;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;
    @Column(nullable = false)
    private String gender;
    private LocalDate yob;
    private String bio;
    // Sở thích người dùng, lưu dạng chuỗi
    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest", columnDefinition = "NVARCHAR(64)")
    private Set<String> interests = new LinkedHashSet<>();

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;
//    private boolean isOwner;


}

