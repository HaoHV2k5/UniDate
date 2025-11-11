package com.microsoft.hsf302_project.controller;

import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.PremiumStatusResponse;
import com.microsoft.hsf302_project.dto.response.TransactionResponse;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.service.PaymentService;
import com.microsoft.hsf302_project.service.PremiumService;
import com.microsoft.hsf302_project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/premium")
@RequiredArgsConstructor
public class PremiumController {
    private final PremiumService premiumService;
    private final UserService userService;
    private final PaymentService paymentService;

    // User lấy trạng thái premium hiện tại
    @GetMapping("/status")
    public ApiResponse<PremiumStatusResponse> getPremiumStatus(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUser(username);
        return ApiResponse.<PremiumStatusResponse>builder()
                .message("đã lấy trạng thái gói thành công")
                .data(premiumService.getPremiumStatus(user))
                .build();
    }

    // Lịch sử mua gói của bản thân
    @GetMapping("/history")
    public ApiResponse<List<TransactionResponse>> getTransactionHistory(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUser(username);
        return ApiResponse.<List<TransactionResponse>>builder()
                .data(premiumService.getTransactionHistory(user))
                .message("đã lấy danh sách transaction thành công")
                .build();
    }

    // Admin lấy danh sách giao dịch toàn hệ thống
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/transactions")
    public ApiResponse<Page<TransactionResponse>> getAllTransactions(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return  ApiResponse.<Page<TransactionResponse>>builder()
                .message("admin lấy danh sách giao dịch thành công")
                .data(premiumService.getTransactionsForAdmin(userId, page, size))
                .build();
    }


    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/balance/admin")
    public ApiResponse<BigDecimal> getBalanceAdmin(){
        return ApiResponse.<BigDecimal>builder()
                .message("đã lấy dư ví admin thành công")
                .data(paymentService.getBalanceAdmin())
                .build();
    }
}
