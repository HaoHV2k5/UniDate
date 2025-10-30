package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.Swipe;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.enums.SwipeAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SwipeRepo extends JpaRepository<Swipe, Long> {
    Optional<Swipe> findBySourceUserAndTargetUser(User source, User target);

    // Thêm 2 method theo id để đỡ phải load User
    Optional<Swipe> findBySourceUserIdAndTargetUserId(Long sourceId, Long targetId);

    Page<Swipe> findBySourceUser(User source, Pageable pageable);
    Page<Swipe> findBySourceUserAndAction(User source, SwipeAction action, Pageable pageable);
}