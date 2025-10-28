package com.microsoft.hsf302_project.repository;

import com.microsoft.hsf302_project.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepo extends JpaRepository<Users, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    Optional<Users> findByEmail(String email);

    // thêm để login theo username
    Optional<Users> findByUsername(String username);
}
