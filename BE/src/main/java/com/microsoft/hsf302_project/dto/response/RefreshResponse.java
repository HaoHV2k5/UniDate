package com.microsoft.hsf302_project.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RefreshResponse {

    private String token;
    private String refreshToken;

}
