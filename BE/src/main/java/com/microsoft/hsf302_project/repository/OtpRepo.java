package com.microsoft.hsf302_project.repository;

import com.microsoft.hsf302_project.entity.OTP;
import com.microsoft.hsf302_project.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepo extends JpaRepository<OTP, Long> {

    /**
     * Tìm OTP mới nhất THỎA ĐỒNG THỜI:
     *  - đúng user
     *  - đúng code
     *  - chưa dùng
     *  - còn hạn (expiredAt > now)
     */
    Optional<OTP> findTopByUserAndCodeAndIsUsedFalseAndExpiredAtAfterOrderByCreatedAtDesc(
            Users user, String code, LocalDateTime now
    );

    /**
     * Vô hiệu hóa TẤT CẢ OTP còn hiệu lực của user (chưa dùng & chưa hết hạn)
     * — dùng trước khi sinh OTP mới để tránh xung đột verify.
     */
    @Modifying
    @Query("""
           update OTP o
              set o.isUsed = true
            where o.user = :user
              and o.isUsed = false
              and o.expiredAt > :now
           """)
    int invalidateActiveForUser(@Param("user") Users user, @Param("now") LocalDateTime now);
}
