package com.microsoft.hsf302_project.controller;


import com.microsoft.hsf302_project.dto.request.BuyPackageRequest;
import com.microsoft.hsf302_project.dto.response.ApiResponse;
import com.microsoft.hsf302_project.dto.response.WalletTransactionResponse;
import com.microsoft.hsf302_project.service.PaymentService;
import com.microsoft.hsf302_project.service.WalletTransactionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j

public class PaymentController {
    private final PaymentService paymentService;
    private final WalletTransactionService walletTransactionService;

    // nap vao vi

        @PostMapping("/buy-premium")
    public ApiResponse<Map<String, Object>> createPayment(HttpServletRequest req, @RequestParam Long userId) {
        Map<String, Object> map = paymentService.generateLinkPayment(req, userId);
        return ApiResponse.<Map<String, Object>>builder().data(map).build();
    }
//// mua goi
//@PreAuthorize("hasAnyAuthority('ROLE_SELLER','ROLE_USER')")
////    @PostMapping("/buy-package")
//    public ApiResponse<Boolean> buyPackage(@RequestBody BuyPackageRequest request) {
////       boolean ans = paymentService.handleBuyTransaction(request.getUserId(),request.getPackageId());
////       String mess = ans? "mua thành công" : "mua thất bại! không đủ tiền trong ví";
////       return ApiResponse.<Boolean>builder().data(ans).message(mess).build();
////    }

    @GetMapping("/payment-return")
    public ResponseEntity<Void> handleVnpayReturn(HttpServletRequest request) {
        String result = paymentService.vnpReturn(request);

        String redirectUrl = "http://localhost:5173/payment-fail";
        if ("success".equals(result)) {
            redirectUrl = "http://localhost:5173/payment-success";
        }

        return ResponseEntity.status(HttpStatus.FOUND) // 302 redirect
                .location(URI.create(redirectUrl))
                .build();
    }



    //    @GetMapping("/payment-return")
//    public Map<String, Object> testReturn(HttpServletRequest request) {
//        Map<String, Object> response = new HashMap<>();
//        response.put("message", "Đã nhận callback từ VNPAY");
//        response.put("params", request.getParameterMap()); // in ra hết param callback
//        return response;
//    }
    @GetMapping("/callback")
    public ResponseEntity<Map<String, String>> handleVnpayIpn(@RequestParam Map<String, String> requestParams) {
        log.warn("đã callback");
        Map<String, String> response = paymentService.handleVnpayIpn(requestParams);
        return ResponseEntity.ok(response);
    }



    @GetMapping("/wallet-transaction/admin")
    public ApiResponse<List<WalletTransactionResponse>> getWalletTransactions() {

        return ApiResponse.<List<WalletTransactionResponse>>builder()
                .message("đã lấy biến đồng số dư ví admin thành công")
                .data(walletTransactionService.getWalletTransactionResponseList())
                .build();
    }





}

