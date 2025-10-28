package com.microsoft.hsf302_project.repository;

import com.microsoft.hsf302_project.entity.LikeHistory;
import com.microsoft.hsf302_project.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeHistoryRepo extends JpaRepository<LikeHistory, Long> {
    Optional<LikeHistory> findBySwiperAndTarget(Users swiper, Users target);
    Page<LikeHistory> findAllBySwiperOrderByDecidedAtDesc(Users swiper, Pageable pageable);
}
