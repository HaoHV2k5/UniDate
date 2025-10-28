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
import java.util.Objects;

@RestControllerAdvice
public class GlobalException {
    private static final String  MIN_STRING = "min";

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception ex) {

        ApiResponse apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.UNCATEGORIZED.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED.getMessage());
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED.getHttpStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse> handleAuthorException(AuthorizationDeniedException ex){
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        ApiResponse apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleArguementException(MethodArgumentNotValidException e) {
        String enumKey = e.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String,Object> attribute = null;
        try {
            errorCode = ErrorCode.valueOf(enumKey);
            var constraintViolation = e.getBindingResult().getAllErrors().get(0).unwrap(ConstraintViolation.class);
            attribute = constraintViolation.getConstraintDescriptor().getAttributes();
        }catch (IllegalArgumentException ex){

        }
        ApiResponse apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(Objects.nonNull(attribute)? mapAttribute(errorCode.getMessage(), attribute): errorCode.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);


    }

    public String mapAttribute(String message, Map<String,Object> attributes){
        String min = String.valueOf(attributes.get(MIN_STRING));
        return message.replace("{"+MIN_STRING+"}",min);

    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse> handleJsonFormatError(HttpMessageNotReadableException ex) {
        ApiResponse apiResponse = ApiResponse.builder().code(ErrorCode.DATE_FORMAT_INVALID.getCode()).message(ErrorCode.DATE_FORMAT_INVALID.getMessage()).build();
        return ResponseEntity.status(ErrorCode.DATE_FORMAT_INVALID.getHttpStatusCode()).body(apiResponse);

    }

    @ExceptionHandler(value = DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse>  handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        ApiResponse apiResponse = ApiResponse.builder().code(ErrorCode.USER_EXISTED.getCode()).message(ErrorCode.USER_EXISTED.getMessage()).build();
        return ResponseEntity.status(ErrorCode.USER_EXISTED.getHttpStatusCode()).body(apiResponse);
    }


}
