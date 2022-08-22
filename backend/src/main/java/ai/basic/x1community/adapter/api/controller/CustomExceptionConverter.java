package ai.basic.x1community.adapter.api.controller;

import ai.basic.x1community.adapter.dto.ApiResult;
import ai.basic.x1community.adapter.exception.ApiException;
import ai.basic.x1community.usecase.exception.UsecaseCode;
import ai.basic.x1community.usecase.exception.UsecaseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * @author Jagger Wang
 */
@Slf4j
public class CustomExceptionConverter {

    public ResponseEntity<ApiResult> convert(Throwable throwable) {
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
            log.error("unknown exception", throwable);

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResult(UsecaseCode.UNKNOWN, throwable.toString()));
        }
    }

}
