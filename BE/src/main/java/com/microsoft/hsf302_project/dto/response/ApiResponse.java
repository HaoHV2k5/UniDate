package com.microsoft.hsf302_project.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiResponse<T> {
    private int code;         // 0 = success, khác 0 = error
    private String message;
    private T result;

    public static <T> ApiResponse<T> ok(T data){
        return ApiResponse.<T>builder().code(0).message("success").result(data).build();
    }
}
