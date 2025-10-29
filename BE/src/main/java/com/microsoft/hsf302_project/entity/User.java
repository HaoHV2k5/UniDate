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
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;
<<<<<<< HEAD

    @Column(nullable = false)
    private String password;

    private String fullName;
=======
    private String passwordHash;
    private String fullName;
    private String email;
    private String phone;
    private Gender gender;
    private LocalDate birthDate;
    private String bio;
    private String major;
    private String university;
    private Role role;
    private boolean active;
>>>>>>> 9724edb95802fb6cc307c80940bc061ec098dc84

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
