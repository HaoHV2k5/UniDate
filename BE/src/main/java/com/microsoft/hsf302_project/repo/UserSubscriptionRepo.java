package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.UserSubscription;
import com.microsoft.hsf302_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSubscriptionRepo extends JpaRepository<UserSubscription, Long> {
    List<UserSubscription> findByUser(User user);
}

