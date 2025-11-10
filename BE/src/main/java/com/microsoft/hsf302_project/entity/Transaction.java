package com.microsoft.hsf302_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer amount;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "package_id")
    private PremiumPackage premiumPackage;

    @ManyToOne
    @JoinColumn(name = "subscription_id")
    private UserSubscription userSubscription;

    
}

