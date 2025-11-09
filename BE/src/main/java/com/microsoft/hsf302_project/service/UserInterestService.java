package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.response.UserInterestResponse;
import com.microsoft.hsf302_project.entity.Interest;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.entity.UserInterest;
import com.microsoft.hsf302_project.mapper.UserInterestMapper;
import com.microsoft.hsf302_project.repo.InterestRepo;
import com.microsoft.hsf302_project.repo.UserInterestRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserInterestService {

    private final UserInterestRepo userInterestRepo;
    private final UserRepo userRepo;
    private final InterestRepo interestRepo;
    private final UserInterestMapper userInterestMapper;

    // Lấy danh sách sở thích của 1 user
    public List<UserInterestResponse> getUserInterests(Long userId) {
        return userInterestMapper.toUserInterestResponseList(userInterestRepo.findByUserId(userId));
    }

    // Thêm 1 sở thích cho user
    public UserInterestResponse addUserInterest(Long userId, Long interestId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Interest interest = interestRepo.findById(interestId)
                .orElseThrow(() -> new RuntimeException("Interest not found"));

        // Kiểm tra tránh trùng
        boolean exists = userInterestRepo.findByUserId(userId).stream()
                .anyMatch(ui -> ui.getInterest().getId().equals(interestId));
        if (exists) {
            throw new RuntimeException("User already has this interest");
        }

        UserInterest userInterest = new UserInterest(user, interest);
        userInterestRepo.save(userInterest);
        return userInterestMapper.toUserInterestResponse(userInterest);
    }

    // Xóa 1 sở thích cụ thể của user
    public void removeUserInterest(Long userId, Long interestId) {
        userInterestRepo.deleteByUserIdAndInterestId(userId, interestId);
    }

    // Xóa tất cả sở thích của user
    public void removeAllUserInterests(Long userId) {
        userInterestRepo.deleteByUserId(userId);
    }
}
