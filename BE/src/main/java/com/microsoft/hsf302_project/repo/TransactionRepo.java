package com.microsoft.hsf302_project.repo;

import com.microsoft.hsf302_project.entity.Transaction;
import com.microsoft.hsf302_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TransactionRepo extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    Page<Transaction> findAll(Pageable pageable);
    Page<Transaction> findByUser(User user, Pageable pageable);
}

