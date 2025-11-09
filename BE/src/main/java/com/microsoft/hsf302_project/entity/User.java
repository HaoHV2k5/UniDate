package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    @Column(name = "locked",nullable = false)
    @Builder.Default
    private boolean locked = false;
    private String phone;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;
//    @Column(nullable = false)
    private String gender;
    private LocalDate yob;
    private String bio;

//    private boolean isOwner;


}

