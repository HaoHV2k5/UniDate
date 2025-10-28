package com.microsoft.hsf302_project.service.impl;

import com.microsoft.hsf302_project.dto.request.SwipeRequest;
import com.microsoft.hsf302_project.dto.response.SwipeItemResponse;
import com.microsoft.hsf302_project.entity.LikeHistory;
import com.microsoft.hsf302_project.entity.Users;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repository.LikeHistoryRepo;
import com.microsoft.hsf302_project.repository.UsersRepo;
import com.microsoft.hsf302_project.service.SwipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class SwipeServiceImpl implements SwipeService {
    private final LikeHistoryRepo likeRepo;
    private final UsersRepo usersRepo;

    @Override
    public void swipe(Long swiperUserId, SwipeRequest req) {
        Users swiper = usersRepo.findById(swiperUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Users target = usersRepo.findById(req.getTargetUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String decision = req.getLike() ? "like" : "pass";
        var existing = likeRepo.findBySwiperAndTarget(swiper, target).orElse(null);
        if (existing == null) {
            likeRepo.save(LikeHistory.builder()
                    .swiper(swiper).target(target)
                    .decision(decision).decidedAt(LocalDateTime.now()).build());
        } else {
            existing.setDecision(decision);
            existing.setDecidedAt(LocalDateTime.now());
            likeRepo.save(existing);
        }
    }

    @Override
    public Page<SwipeItemResponse> history(Long swiperUserId, int page, int size) {
        Users swiper = usersRepo.findById(swiperUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return likeRepo.findAllBySwiperOrderByDecidedAtDesc(swiper, PageRequest.of(page, size))
                .map(h -> SwipeItemResponse.builder()
                        .targetUserId(h.getTarget().getId())
                        .decision(h.getDecision())
                        .decidedAt(h.getDecidedAt())
                        .build());
    }
}
