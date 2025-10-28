package com.microsoft.hsf302_project.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"code","message","data","result"})
public class ApiResponse<T> {

    // Mặc định success = 0 (giữ hành vi nhánh HEAD); nếu muốn theo nhánh kia đổi thành 1000.
    @Builder.Default
    int code = 0;

    String message;

    // Trường chính dùng trong code nhánh master (login/introspect/refresh)
    T data;

    // Alias để không phá vỡ FE/BE cũ đang đọc "result"
    @JsonProperty("result")
    public T getResult() { return data; }

    // ---- Convenience helpers (giữ theo HEAD) ----
    public static <T> ApiResponse<T> ok(T payload) {
        return ApiResponse.<T>builder()
                .code(0)
                .message("success")
                .data(payload)      // xuất ra cả data và result (alias)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .build();
    }
}
