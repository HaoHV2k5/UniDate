package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity
@Table(name="users",
        indexes = {
                @Index(name="uk_users_email", columnList="email", unique=true),
                @Index(name="uk_users_phone", columnList="phone", unique=true),
                @Index(name="uk_users_username", columnList="username", unique=true)})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Users {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String phone;
    private String passwordHash;

    private String fullName;
    private String gender;
    private LocalDate birthDate;
    private String bio;

    private Boolean isActive = false;
    private Boolean isDeleted = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
