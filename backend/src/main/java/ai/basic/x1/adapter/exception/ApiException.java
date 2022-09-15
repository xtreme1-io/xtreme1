package ai.basic.x1.adapter.exception;

import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * @author Jagger Wang
 */
public class ApiException extends UsecaseException {
    private static final long serialVersionUID = 1L;

    private final HttpStatus status;
    private final Map<String, Object> data;

    public ApiException(HttpStatus status, UsecaseCode code, String message,
                        Map<String, Object> data) {
        super(code, message);

        this.status = status;
        this.data = data;
    }

    public ApiException(HttpStatus status, UsecaseCode code, String message) {
        this(status, code, message, null);
    }

    public ApiException(HttpStatus status) {
        this(status, UsecaseCode.UNKNOWN, status.toString());
    }

    public ApiException(UsecaseCode code, String message) {
        this(HttpStatus.OK, code, message);
    }

    public ApiException(UsecaseCode code) {
        this(HttpStatus.OK, code, code.getMessage());
    }


    public HttpStatus getStatus() {
        return status;
    }

    public Map<String, Object> getData() {
        return data;
    }
}
