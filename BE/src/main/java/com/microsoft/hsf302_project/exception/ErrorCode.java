package com.microsoft.hsf302_project.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED(9999, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXISTED(1001, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1002, "Tên người dùng không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1003, "Mật khẩu phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1004, "Khóa thông báo không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Bạn phải ít nhất {min} tuổi", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_BLANK(1009, "Mật khẩu không được để trống", HttpStatus.BAD_REQUEST),
    CONFIRM_PASSWORD_NOT_BLANK(1010, "Xác nhận mật khẩu không được để trống", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_BLANK(1011, "Email không được để trống", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1012, "Email không hợp lệ", HttpStatus.BAD_REQUEST),
    FULLNAME_NOT_BLANK(1013, "Họ tên không được để trống", HttpStatus.BAD_REQUEST),
    YOB_NOT_BLANK(1014, "Năm sinh không được để trống", HttpStatus.BAD_REQUEST),

    PHONE_INVALID(1015, "Số điện thoại không hợp lệ", HttpStatus.BAD_REQUEST),
    DATE_FORMAT_INVALID(1016, "Định dạng ngày không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCH(1017, "Mật khẩu không khớp", HttpStatus.BAD_REQUEST),
    USERNAME_NOT_BLANK(1018, "Tên người dùng không được để trống", HttpStatus.BAD_REQUEST),
    EMAIL_SEND_UNSUCCESS(1019, "Gửi email thất bại", HttpStatus.BAD_REQUEST),
    OTP_NOT_VERIFY (1021, "Tài khoản chưa được xác thực bằng OTP", HttpStatus.BAD_REQUEST),
    ACCOUNT_LOCKED(1022, "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),
    OTP_INVALID (1023, "OTP không đúng!, hãy thử lại", HttpStatus.BAD_REQUEST),
    USER_ROLE_NOT_FOUND (1023, "Không tìm thấy User role trong hệ thống!", HttpStatus.BAD_REQUEST),

    ACCOUNT_EXISTED (1023, "Email này đã được sử dụng", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND (1024, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    TITLE_NOT_BLANK (1025, "Title không được để trống", HttpStatus.NOT_FOUND),
    CONTENT_NOT_BLANK (1026, "Content không được để trống", HttpStatus.NOT_FOUND),
    TITLE_LENGTH_NOT_VALID (1027, "Độ dài không hợp lệ! Chỉ từ 5 đến 50 kí tự", HttpStatus.NOT_FOUND),
    POST_NOT_EXISTED (1028, "Bài đăng không tồn tại", HttpStatus.NOT_FOUND),

    LOGIN_FAIL (1029, "Đăng nhập không thành công, mật khẩu không đúng", HttpStatus.NOT_FOUND),
    EMAIL_EXISTED (1030, "Email này đã được sử dụng", HttpStatus.NOT_FOUND),
    FRIEND_REQUEST_NOT_FOUND(1040, "Lời mời kết bạn không tồn tại", HttpStatus.NOT_FOUND),
    FRIEND_REQUEST_ALREADY_SENT(1041, "Đã gửi lời mời kết bạn trước đó", HttpStatus.CONFLICT),
    NO_PERMISSION_VIEW(1042, "Bạn chưa có quyền xem album này", HttpStatus.CONFLICT),
    DUPLICATE_REQUEST_VIEW(1043, "Bạn đã gửi yêu cầu truy cập album này rồi", HttpStatus.CONFLICT),
    NOT_OWNER_ALBUM(1044, "Bạn không phải chủ sở hữu album này!", HttpStatus.CONFLICT),





    ;
    private int code;
    private String message;
    private HttpStatusCode  httpStatusCode;
     private ErrorCode(int code, String message, HttpStatusCode httpStatusCode){
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

}
