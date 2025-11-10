package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.response.PremiumStatusResponse;
import com.microsoft.hsf302_project.dto.response.TransactionResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.service.PremiumService;
import com.microsoft.hsf302_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/premium")
@RequiredArgsConstructor
public class PremiumController {
    private final PremiumService premiumService;
    private final UserService userService;

    // User lấy trạng thái premium hiện tại
    @GetMapping("/status")
    public ResponseEntity<PremiumStatusResponse> getPremiumStatus(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUser(username);
        return ResponseEntity.ok(premiumService.getPremiumStatus(user));
    }

    // Lịch sử mua gói của bản thân
    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> getTransactionHistory(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUser(username);
        return ResponseEntity.ok(premiumService.getTransactionHistory(user));
    }

    // Admin lấy danh sách giao dịch toàn hệ thống
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionResponse>> getAllTransactions(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(premiumService.getTransactionsForAdmin(userId, page, size));
    }
}
