package com.microsoft.hsf302_project.repo;


import com.microsoft.hsf302_project.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepo extends JpaRepository<Wallet,Long> {

    Optional<Wallet> findByUserId(long userId);
}
