package com.microsoft.hsf302_project.dto.request;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class RegisterRequest {
    @NotEmpty(message = "PASSWORD_NOT_BLANK")
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String password;

    @NotEmpty(message = "CONFIRM_PASSWORD_NOT_BLANK")
    private String confirmPassword;

    @NotEmpty(message = "EMAIL_NOT_BLANK")
    @Email(message = "EMAIL_INVALID")
    private String email;

    @NotEmpty(message = "FULLNAME_NOT_BLANK")
    private String fullName;

    private String gender;
    @NotNull(message = "YOB_NOT_BLANK")
    @DateTimeFormat(pattern = "dd/MM/yyyy")
    private LocalDate yob;

    @Pattern(regexp = "^(84|0[35789])[0-9]{8}\\b", message = "PHONE_INVALID" )
    private String phone;

    private String address;

    private MultipartFile image;



}
