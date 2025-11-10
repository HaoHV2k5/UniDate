package com.microsoft.hsf302_project.service;

import com.microsoft.hsf302_project.entity.PremiumPackage;
import com.microsoft.hsf302_project.entity.Transaction;
import com.microsoft.hsf302_project.entity.UserSubscription;
import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.microsoft.hsf302_project.repo.PremiumPackageRepo;
import com.microsoft.hsf302_project.repo.TransactionRepo;
import com.microsoft.hsf302_project.repo.UserRepo;
import com.microsoft.hsf302_project.repo.UserSubscriptionRepo;
import com.microsoft.hsf302_project.dto.response.PremiumStatusResponse;
import com.microsoft.hsf302_project.dto.response.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PremiumService {

    private final  PremiumPackageRepo premiumPackageRepo;

    private final  UserSubscriptionRepo userSubscriptionRepo;

    private final  UserRepo userRepo;

    private final  TransactionRepo transactionRepo;

    public void handlePaymentCallback(Long userId, Long packageId, Integer amount, String paymentMethod, String transactionStatus) {
        User user = userRepo.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        PremiumPackage pkg = premiumPackageRepo.findById(packageId).orElseThrow();
        LocalDateTime now = LocalDateTime.now();

        // tạo/ghi đè subscription
        UserSubscription sub = new UserSubscription();
        sub.setUser(user);
        sub.setPremiumPackage(pkg);
        sub.setStartTime(now);
        sub.setEndTime(now.plusDays(pkg.getDurationDays()));
        sub.setStatus("active");
        sub = userSubscriptionRepo.save(sub);

        // lưu transaction
        Transaction txn = new Transaction();
        txn.setUser(user);
        txn.setAmount(amount);
        txn.setPaymentMethod(paymentMethod);
        txn.setStatus(transactionStatus);
        txn.setCreatedAt(now);
        txn.setPremiumPackage(pkg);
        txn.setUserSubscription(sub);
        transactionRepo.save(txn);
    }

    public boolean isPremiumActive(User user) {
        Optional<UserSubscription> sub = userSubscriptionRepo.findByUser(user).stream()
                .filter(s -> s.getStatus().equals("active") && s.getEndTime().isAfter(LocalDateTime.now()))
                .findFirst();
        return sub.isPresent();
    }

    public PremiumStatusResponse getPremiumStatus(User user) {
        // Luôn tự kiểm tra và cập nhật status trước khi trả về
        userSubscriptionRepo.findByUser(user).forEach(sub -> {
            if (sub.getStatus().equals("active") && sub.getEndTime().isBefore(LocalDateTime.now())) {
                sub.setStatus("expired");
                userSubscriptionRepo.save(sub);
            }
        });

        return userSubscriptionRepo.findByUser(user).stream()
                .filter(sub -> sub.getStatus().equals("active") && sub.getEndTime().isAfter(LocalDateTime.now()))
                .findFirst()
                .map(sub -> new PremiumStatusResponse(true, sub.getStartTime(), sub.getEndTime(), sub.getPremiumPackage().getName()))
                .orElseThrow(() -> new AppException(ErrorCode.PREMIUM_NOT_EXIST));
    }

    public List<TransactionResponse> getTransactionHistory(User user) {
        List<Transaction> txs = transactionRepo.findByUser(user);
        return txs.stream().map(txn -> {
            TransactionResponse tr = new TransactionResponse();
            tr.setId(txn.getId());
            tr.setCreatedAt(txn.getCreatedAt());
            tr.setAmount(txn.getAmount());
            tr.setStatus(txn.getStatus());
            tr.setPackageName(txn.getPremiumPackage() != null ? txn.getPremiumPackage().getName() : null);
            if (txn.getUserSubscription() != null) {
                tr.setPremiumStart(txn.getUserSubscription().getStartTime());
                tr.setPremiumEnd(txn.getUserSubscription().getEndTime());
            }
            return tr;
        }).toList();
    }

    // Dành cho admin: filter theo userId, trạng thái, v.v.
    public Page<TransactionResponse> getTransactionsForAdmin(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Transaction> txPage;
        if (userId == null) {
            txPage = transactionRepo.findAll(pageable);
        } else {
            // Có thể mở rộng: lọc theo state/gói...
            txPage = transactionRepo.findByUser(userRepo.findById(userId).orElseThrow(), pageable);
        }
        return txPage.map(txn -> {
            TransactionResponse tr = new TransactionResponse();
            tr.setId(txn.getId());
            tr.setCreatedAt(txn.getCreatedAt());
            tr.setAmount(txn.getAmount());
            tr.setStatus(txn.getStatus());
            tr.setPackageName(txn.getPremiumPackage() != null ? txn.getPremiumPackage().getName() : null);
            if (txn.getUserSubscription() != null) {
                tr.setPremiumStart(txn.getUserSubscription().getStartTime());
                tr.setPremiumEnd(txn.getUserSubscription().getEndTime());
            }
            return tr;
        });
    }
}
