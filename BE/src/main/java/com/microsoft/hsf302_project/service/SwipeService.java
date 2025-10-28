package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.dto.request.SwipeRequest;
import com.microsoft.hsf302_project.dto.response.SwipeItemResponse;
import org.springframework.data.domain.Page;

public interface SwipeService {
    void swipe(Long swiperUserId, SwipeRequest req);
    Page<SwipeItemResponse> history(Long swiperUserId, int page, int size);
}
