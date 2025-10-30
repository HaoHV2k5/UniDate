package com.microsoft.hsf302_project.repo;


import com.microsoft.hsf302_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User,Long> {
//    boolean existsByEmail(String email);

//    Optional<User> findByEmail(String  email);

    Optional<User> findByUsername(String username);
//    boolean existsByUsername(String username);

}
