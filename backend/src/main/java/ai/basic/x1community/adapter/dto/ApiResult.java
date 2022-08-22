package ai.basic.x1community.adapter.dto;

import ai.basic.x1community.usecase.exception.UsecaseCode;
import lombok.Data;

/**
 * @author Jagger Wang
 */
@Data
public class ApiResult<T> {
    private UsecaseCode code;
    private String message;

    private T data;

    public ApiResult(UsecaseCode code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public ApiResult(UsecaseCode code, String message) {
        this(code, message, null);
    }

    public ApiResult(T data) {
        this(UsecaseCode.OK, "", data);
    }

    public ApiResult() {
        this(UsecaseCode.OK, "", null);
    }

    public static ApiResult<?> success() {
        return new ApiResult<>();
    }
}