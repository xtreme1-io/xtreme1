package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.exception.ApiException;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * @author Jagger Wang
 */
@RestControllerAdvice
@Slf4j
public class CustomExceptionHandler {

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<ApiResult> handle(Throwable throwable) {
        log.error("throwable",throwable);
        if (throwable instanceof ApiException) {
            var e = (ApiException) throwable;
            return ResponseEntity
                    .status(e.getStatus())
                    .body(new ApiResult(e.getCode(), e.getMessage(), e.getData()));
        } else if (throwable instanceof UsecaseException) {
            var e = (UsecaseException) throwable;
            return ResponseEntity
                    .ok()
                    .body(new ApiResult(e.getCode(), e.getMessage()));
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult(UsecaseCode.UNKNOWN, throwable.toString()));
        }
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResult<?>> constraintViolationException(ConstraintViolationException exception) {
        log.error("ValidationException",exception);
        Set<ConstraintViolation<?>> constraintViolations = exception.getConstraintViolations();
        Iterator<ConstraintViolation<?>> iterator = constraintViolations.iterator();
        StringBuilder builder = new StringBuilder();
        while (iterator.hasNext()) {
            ConstraintViolation<?> constraint = iterator.next();
            String message = constraint.getPropertyPath() + ":" + constraint.getMessage();
            builder.append(message);
        }
        return new ResponseEntity<>(new ApiResult<>(UsecaseCode.PARAM_ERROR, builder.toString()), HttpStatus.OK);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResult> validException(BindException bindException) {
        log.error("bindException",bindException);
        List<String> errorMsgList = new ArrayList<>();
        for (ObjectError objectError : bindException.getAllErrors()) {
            if (objectError instanceof FieldError) {
                FieldError fieldError = (FieldError) objectError;
                errorMsgList.add(fieldError.getField() + " " + fieldError.getDefaultMessage());
            } else {
                errorMsgList.add(objectError.getObjectName() + " " + objectError.getDefaultMessage());
            }
        }
        return new ResponseEntity(new ApiResult(UsecaseCode.PARAM_ERROR, JSONUtil.toJsonStr(errorMsgList)), HttpStatus.OK);
    }

}
