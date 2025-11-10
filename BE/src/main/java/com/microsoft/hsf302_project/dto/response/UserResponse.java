package com.microsoft.hsf302_project.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String gender;
    private String bio;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate yob;
    private String avatar;
    private String address;
    private java.util.Set<String> interests;


    private Double latitude;
    private Double longitude;
}
