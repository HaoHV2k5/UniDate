package com.microsoft.hsf302_project.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMatchResponse {

    private String name;
    private double matchScore;
    private String reason;

}
