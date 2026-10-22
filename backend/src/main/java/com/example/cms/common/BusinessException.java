package com.example.cms.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String code;
    private final Object details;

    public BusinessException(String message, HttpStatus status, String code) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = null;
    }

    public BusinessException(String message, HttpStatus status, String code, Object details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }

    public static BusinessException badRequest(String message) {
        return new BusinessException(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }

    public static BusinessException badRequest(String message, String code) {
        return new BusinessException(message, HttpStatus.BAD_REQUEST, code);
    }

    public static BusinessException unauthorized(String message) {
        return new BusinessException(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }

    public static BusinessException forbidden(String message) {
        return new BusinessException(message, HttpStatus.FORBIDDEN, "FORBIDDEN");
    }

    public static BusinessException notFound(String message) {
        return new BusinessException(message, HttpStatus.NOT_FOUND, "NOT_FOUND");
    }

    public static BusinessException conflict(String message) {
        return new BusinessException(message, HttpStatus.CONFLICT, "CONFLICT");
    }

    public static BusinessException tooManyRequests(String message) {
        return new BusinessException(message, HttpStatus.TOO_MANY_REQUESTS, "TOO_MANY_REQUESTS");
    }

    public static BusinessException internalError(String message) {
        return new BusinessException(message, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");
    }
}