package com.microsoft.hsf302_project.config;


import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.entity.Wallet;
import com.microsoft.hsf302_project.repo.UserRepo;
import com.microsoft.hsf302_project.repo.WalletRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
@Slf4j
@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    private final PasswordEncoder passwordEncoder;
    private final WalletRepo walletRepo;
    @Bean
    public ApplicationRunner  init(UserRepo userRepository) {
        log.info("Initializing application.....");

        return args -> {
           if (userRepository.findByUsername("admin@gmail.com").isEmpty()) {




               // Tạo admin user

               User user = User.builder()
                       .username("admin@gmail.com")
                       .password(passwordEncoder.encode("admin"))
                       .role("ADMIN")
                       .email("admin@gmail.com")
                       .fullName("ADMIN")
                       .gender("M")
                       .build();
               userRepository.save(user);




               log.info("Application initialization completed .....");
           };
           User user = userRepository.findUserByRole("ADMIN");
           if(walletRepo.findByUserId(user.getId()).isEmpty()) {
              Wallet wallet = Wallet.builder()
                      .balance(BigDecimal.ZERO)
                      .isActive(true)
                      .user(user)
                      .updatedAt(LocalDateTime.now())
                      .lastTransactionAt(LocalDateTime.now())
                      .createdAt(LocalDateTime.now())
                      .build();
              walletRepo.save(wallet);
              log.info("Application initialization wallet admin completed .....");
           }
       };
    }

}
