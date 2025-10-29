package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.entity.UserOtp;
import com.microsoft.hsf302_project.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserOtpRepo extends JpaRepository<UserOtp, Long> {
    Optional<UserOtp> findTopByUserAndTypeAndUsedFalseOrderByCreatedAtDesc(User user, OtpType type);
}
