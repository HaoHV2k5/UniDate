package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.InterestRequest;
import com.microsoft.hsf302_project.dto.response.InterestResponse;
import com.microsoft.hsf302_project.entity.Interest;
import com.microsoft.hsf302_project.mapper.InterestMapper;
import com.microsoft.hsf302_project.repo.InterestRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterestService {
    private final InterestRepo interestRepo;
    private final InterestMapper interestMapper;

    // Thêm interest
    public InterestResponse createInterest(InterestRequest req) {
        Interest interest = interestMapper.toInterest(req);
        interestRepo.save(interest);
        return interestMapper.toInterestResponse(interest);
    }

    // Lấy tất cả interest
    public List<InterestResponse> getAllInterests() {
        return interestMapper.toInterestResponseList(interestRepo.findAll());
    }

    // Tìm theo ID
    public InterestResponse getInterestById(Long id) {
        Interest interest = interestRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest not found"));
        return interestMapper.toInterestResponse(interest);
    }

    // Tìm theo category
    public List<InterestResponse> getByCategory(String category) {
        return interestMapper.toInterestResponseList(
                interestRepo.findByCategoryIgnoreCase(category)
        );
    }

    // Cập nhật
    public InterestResponse updateInterest(Long id, InterestRequest req) {
        Interest interest = interestRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest not found"));

        interest.setName(req.getInterestName());
        interest.setCategory(req.getCategory());
        interestRepo.save(interest);

        return interestMapper.toInterestResponse(interest);
    }

    // Xóa
    public void deleteInterest(Long id) {
        interestRepo.deleteById(id);
    }
}
