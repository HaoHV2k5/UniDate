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




}

