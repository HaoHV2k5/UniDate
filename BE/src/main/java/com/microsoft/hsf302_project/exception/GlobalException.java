package com.microsoft.hsf302_project.exception;

import com.microsoft.hsf302_project.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolation;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalException {

    private static final String MIN_STRING = "min";

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        ErrorCode ec = ex.getErrorCode();
        ApiResponse<?> body = ApiResponse.builder()
                .code(ec.getCode())
                .message(ec.getMessage())
                .build();
        return ResponseEntity.status(ec.getHttpStatusCode()).body(body);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAuthorException(AuthorizationDeniedException ex) {
        ErrorCode ec = ErrorCode.UNAUTHORIZED;
        ApiResponse<?> body = ApiResponse.builder()
                .code(ec.getCode())
                .message(ec.getMessage())
                .build();
        return ResponseEntity.status(ec.getHttpStatusCode()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleArgumentException(MethodArgumentNotValidException e) {
        String enumKey = (e.getFieldError() != null) ? e.getFieldError().getDefaultMessage() : null;

        ErrorCode ec = ErrorCode.INVALID_KEY;
        Map<String, Object> attrs = null;

        try {
            if (enumKey != null) {
                ec = ErrorCode.valueOf(enumKey);
            }
            var violation = e.getBindingResult().getAllErrors().get(0).unwrap(ConstraintViolation.class);
            attrs = violation.getConstraintDescriptor().getAttributes();
        } catch (IllegalArgumentException ignored) {
            // giữ ec = INVALID_KEY nếu enumKey không map được
        }

        String msg = (attrs != null) ? mapAttribute(ec.getMessage(), attrs) : ec.getMessage();

        ApiResponse<?> body = ApiResponse.builder()
                .code(ec.getCode())
                .message(msg)
                .build();

        return ResponseEntity.status(ec.getHttpStatusCode()).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleJsonFormatError(HttpMessageNotReadableException ex) {
        ErrorCode ec = ErrorCode.DATE_FORMAT_INVALID;
        ApiResponse<?> body = ApiResponse.builder()
                .code(ec.getCode())
                .message(ec.getMessage())
                .build();
        return ResponseEntity.status(ec.getHttpStatusCode()).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        ErrorCode ec = ErrorCode.USER_EXISTED;
        ApiResponse<?> body = ApiResponse.builder()
                .code(ec.getCode())
                .message(ec.getMessage())
                .build();
        return ResponseEntity.status(ec.getHttpStatusCode()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception ex) {
        ErrorCode ec = ErrorCode.UNCATEGORIZED;
        ApiResponse<?> body = ApiResponse.builder()
                .code(ec.getCode())
                .message(ec.getMessage())
                .build();
        return ResponseEntity.status(ec.getHttpStatusCode()).body(body);
    }

    private String mapAttribute(String message, Map<String, Object> attributes) {
        String min = String.valueOf(attributes.get(MIN_STRING));
        return message.replace("{" + MIN_STRING + "}", min);
    }
}
