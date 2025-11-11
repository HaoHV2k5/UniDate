package com.microsoft.hsf302_project.service;


import com.microsoft.hsf302_project.dto.response.WalletTransactionResponse;
import com.microsoft.hsf302_project.entity.WalletTransaction;
import com.microsoft.hsf302_project.mapper.WalletTransactionMapper;
import com.microsoft.hsf302_project.repo.WalletTransactionRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletTransactionService {
    private  final WalletTransactionRepo walletTransactionRepo;
    private final WalletTransactionMapper walletTransactionMapper;
    public List<WalletTransactionResponse> getWalletTransactionResponseList(){
        List<WalletTransaction> walletTransactionResponseList = walletTransactionRepo.findAll();
        return  walletTransactionMapper.toWalletTransactionResponseList(walletTransactionResponseList);
    }

}
