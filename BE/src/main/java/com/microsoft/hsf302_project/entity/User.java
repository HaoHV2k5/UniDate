package com.microsoft.hsf302_project.entity;

import com.microsoft.hsf302_project.enums.Gender;
import com.microsoft.hsf302_project.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String fullName;

    // Thêm cờ xác thực OTP, mặc định true để user hiện hữu không bị chặn login
    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = true;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate birthDate;
    private String bio;
    private String major;
    private String university;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;
}
