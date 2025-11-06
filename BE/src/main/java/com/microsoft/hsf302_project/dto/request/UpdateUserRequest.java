package com.microsoft.hsf302_project.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.microsoft.hsf302_project.validation.DobConstrain;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    @NotEmpty(message = "FULLNAME_NOT_BLANK")
    private String fullname;

    private String gender;

    @NotNull(message = "YOB_NOT_BLANK")
    @DobConstrain(min = 18, message = "INVALID_DOB")
    @DateTimeFormat(pattern = "dd/MM/yyyy")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate yob;

    @Pattern(regexp = "^(84|0[35789])[0-9]{8}\\b", message = "PHONE_INVALID")
    private String phone;

    private String address;

    private String avatar;

    private Set<String> interests; // ví dụ: ["bóng đá","đọc sách"]
}