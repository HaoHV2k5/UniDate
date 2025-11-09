package com.microsoft.hsf302_project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class NearbyUserResponse {
    private UserResponse user;
    private double distanceKm;
}
