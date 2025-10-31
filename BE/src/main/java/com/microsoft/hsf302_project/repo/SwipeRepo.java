package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.Swipe;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.enums.SwipeAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SwipeRepo extends JpaRepository<Swipe, Long> {
    Optional<Swipe> findBySourceUserAndTargetUser(User source, User target);
    Optional<Swipe> findBySourceUserIdAndTargetUserId(Long sourceId, Long targetId);

    // Xem các lượt MÌNH ĐÃ THỰC HIỆN
    @EntityGraph(attributePaths = {"targetUser"})
    Page<Swipe> findBySourceUserId(Long sourceUserId, Pageable pageable);

    @EntityGraph(attributePaths = {"targetUser"})
    Page<Swipe> findBySourceUserIdAndAction(Long sourceUserId, SwipeAction action, Pageable pageable);

    // HỘP THƯ - CÁC LƯỢT NGƯỜI KHÁC TÁC ĐỘNG LÊN MÌNH
    @EntityGraph(attributePaths = {"sourceUser"})
    Page<Swipe> findByTargetUserId(Long targetUserId, Pageable pageable);

    @EntityGraph(attributePaths = {"sourceUser"})
    Page<Swipe> findByTargetUserIdAndAction(Long targetUserId, SwipeAction action, Pageable pageable);
}
