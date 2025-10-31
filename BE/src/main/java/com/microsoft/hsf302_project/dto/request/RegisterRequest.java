package com.microsoft.hsf302_project.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "USERNAME_NOT_BLANK")
    @Size(min = 3, max = 50, message = "USERNAME_INVALID")
    private String username;

    @NotBlank(message = "EMAIL_NOT_BLANK")
    @Email(message = "EMAIL_INVALID")
    private String email;

    @NotBlank(message = "PASSWORD_NOT_BLANK")
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String password;

    @NotBlank(message = "FULLNAME_NOT_BLANK")
    private String fullName;

    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "INVALID_KEY")
    private String gender; // MALE/FEMALE/OTHER

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthday;

    @Size(max = 512, message = "INVALID_KEY")
    private String bio;

    @Pattern(regexp = "^[0-9+]{8,15}$", message = "PHONE_INVALID")
    private String phone;
}
