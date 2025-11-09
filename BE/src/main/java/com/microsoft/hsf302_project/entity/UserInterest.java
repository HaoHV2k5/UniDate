package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor

public class UserInterest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne
    @JoinColumn(name = "interest_id", nullable = false)
    private Interest interest;

    public UserInterest(User user, Interest interest) {
        this.user = user;
        this.interest = interest;
    }
}
