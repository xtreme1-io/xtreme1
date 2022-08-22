package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.ApiResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

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

}
