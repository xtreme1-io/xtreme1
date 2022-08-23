package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.usecase.exception.UsecaseCode;
import cn.hutool.json.JSONUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * @author Jagger Wang
 */
@ControllerAdvice
public class CustomExceptionHandler {

    private CustomExceptionConverter converter = new CustomExceptionConverter();

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<ApiResult> handle(Throwable e) {
        return converter.convert(e);
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(value = ConstraintViolationException.class)
    public ResponseEntity<ApiResult<?>> constraintViolationException(ConstraintViolationException exception) {
        Set<ConstraintViolation<?>> constraintViolations = exception.getConstraintViolations();
        Iterator<ConstraintViolation<?>> iterator = constraintViolations.iterator();
        StringBuilder builder = new StringBuilder();
        while (iterator.hasNext()) {
            ConstraintViolation<?> constraint = iterator.next();
            String message = constraint.getPropertyPath() + ":" + constraint.getMessage();
            builder.append(message);
        }
        return new ResponseEntity<>(new ApiResult<>(UsecaseCode.PARAM_ERROR, builder.toString()), HttpStatus.BAD_REQUEST);
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(value = {BindException.class})
    public ResponseEntity<ApiResult> validException(BindException bindException) {
        List<String> errorMsgList = new ArrayList<>();
        for (ObjectError objectError : bindException.getAllErrors()) {
            if (objectError instanceof FieldError) {
                FieldError fieldError = (FieldError) objectError;
                errorMsgList.add(fieldError.getField() + " " + fieldError.getDefaultMessage());
            } else {
                errorMsgList.add(objectError.getObjectName() + " " + objectError.getDefaultMessage());
            }
        }
        return new ResponseEntity(new ApiResult(UsecaseCode.PARAM_ERROR, JSONUtil.toJsonStr(errorMsgList)), HttpStatus.BAD_REQUEST);
    }

}
