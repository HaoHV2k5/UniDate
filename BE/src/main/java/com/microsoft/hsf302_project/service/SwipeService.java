package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.SwipeRequest;
import com.microsoft.hsf302_project.dto.response.SwipeHistoryItemResponse;
import com.microsoft.hsf302_project.dto.response.SwipeResponse;
import com.microsoft.hsf302_project.entity.Swipe;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.enums.SwipeAction;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repo.SwipeRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SwipeService {
    private final SwipeRepo swipeRepo;
    private final UserRepo userRepo;

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null) { // chặn NPE -> 401
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String username = authentication.getName();
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public SwipeResponse swipe(Authentication auth, SwipeRequest req) {
        User me = getCurrentUser(auth);

        // Không cho tự like/dislike
        if (me.getId().equals(req.getTargetUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check target tồn tại
        User target = userRepo.findById(req.getTargetUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Tìm swipe hiện tại (ưu tiên theo ID)
        Swipe now = swipeRepo.findBySourceUserIdAndTargetUserId(me.getId(), target.getId())
                .orElseGet(() -> Swipe.builder()
                        .sourceUser(me)
                        .targetUser(target)
                        .createdAt(LocalDateTime.now())
                        .build());

        // Cập nhật action + updatedAt
        now.setAction(req.getAction());
        now.setUpdatedAt(LocalDateTime.now());

        swipeRepo.save(now);

        return SwipeResponse.builder()
                .id(now.getId())
                .targetUserId(target.getId())
                .action(now.getAction())
                .matched(false)
                .build();
    }

    public Page<SwipeHistoryItemResponse> history(Authentication auth, SwipeAction action, int page, int size) {
        User me = getCurrentUser(auth);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Swipe> data = (action == null)
                ? swipeRepo.findBySourceUser(me, pageable)
                : swipeRepo.findBySourceUserAndAction(me, action, pageable);

        return data.map(s -> SwipeHistoryItemResponse.builder()
                .swipeId(s.getId())
                .targetUserId(s.getTargetUser().getId())
                .targetUsername(s.getTargetUser().getUsername())
                .targetFullName(s.getTargetUser().getFullName())
                .action(s.getAction())
                .createdAt(s.getCreatedAt())
                .build());
    }
}
