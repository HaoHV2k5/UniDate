package com.microsoft.hsf302_project.entity;

import com.microsoft.hsf302_project.enums.Gender;
import com.microsoft.hsf302_project.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_phone", columnNames = "phone")
        })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Đăng nhập bằng username
    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 120)
    private String password;

    @Column(nullable = false, length = 120)
    private String fullName;

    // phân quyền USER/ADMIN
    @Column(nullable = false, length = 20)
    private String role;

    // Email dùng nhận OTP & liên lạc
    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 10)
    private String gender; // MALE/FEMALE/OTHER (tuỳ FE map)

    private LocalDate birthday;

    @Column(length = 512)
    private String bio;

    // Cờ xác thực OTP, mặc định true để user cũ, user mới phải verify OTP
    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = true;

}
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
