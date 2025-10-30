package com.microsoft.hsf302_project.config;


import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;
@Slf4j
@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    private final PasswordEncoder passwordEncoder;
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

                       .build();
               userRepository.save(user);

               log.info("Application initialization completed .....");
           };
       };
    }

}
