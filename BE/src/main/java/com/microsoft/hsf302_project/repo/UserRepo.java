package com.microsoft.hsf302_project.repo;


import com.microsoft.hsf302_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User,Long> {


    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    User findUserByEmail(String email);

    User getUserByUsername(String username);

    Optional<User> findByEmail(String email);

    User findUserByRole(String role);
}
