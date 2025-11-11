package com.microsoft.hsf302_project.mapper;

import com.microsoft.hsf302_project.dto.response.WalletTransactionResponse;
import com.microsoft.hsf302_project.entity.WalletTransaction;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WalletTransactionMapper {

    WalletTransactionResponse toWalletTransactionResponse(WalletTransaction walletTransaction);
    List<WalletTransactionResponse> toWalletTransactionResponseList(List<WalletTransaction> walletTransactionList);

}
