package com.microsoft.hsf302_project.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuyPackageRequest {
    private Long userId;
    private Long packageId;
    // getter/setter

}
