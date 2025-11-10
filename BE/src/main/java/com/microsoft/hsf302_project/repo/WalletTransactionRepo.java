package com.microsoft.hsf302_project.repo;


import com.microsoft.hsf302_project.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletTransactionRepo extends JpaRepository<WalletTransaction, Long> {
    Optional<WalletTransaction> findByTransactionCode(String txnRef );


    @Query("select p from WalletTransaction p where p.wallet.id = ?1")
    List<WalletTransaction> findbyWalletid( Long walletId);

}
