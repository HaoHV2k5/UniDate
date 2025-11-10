package com.microsoft.hsf302_project.enums;

import lombok.Getter;

@Getter
public enum WalletTransactionStatus {
    PENDING("PENDING"),
    COMPLETED("COMPLETED"),
    FAILED("FAILED"),
    CANCELLED("CANCELLED");

    private final String value;

    WalletTransactionStatus(String value) {
        this.value = value;
    }

}
