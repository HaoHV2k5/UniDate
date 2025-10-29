package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String fullName;
    private String role;

    // Thêm cờ xác thực OTP, mặc định true để user hiện hữu không bị chặn login
    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = true;




}

