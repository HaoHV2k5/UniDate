package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInterestRepo extends JpaRepository<UserInterest, Long> {
    List<UserInterest> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    void deleteByUserIdAndInterestId(Long userId, Long interestId);
}
