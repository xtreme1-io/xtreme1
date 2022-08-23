package ai.basic.x1.usecase.exception;

/**
 * @author Jagger Wang
 */
public class UsecaseException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final UsecaseCode code;

    public UsecaseException(UsecaseCode code) {
        super(code.getMessage());
        this.code = code;
    }

    public UsecaseException(UsecaseCode code, String message) {
        super(message);
        this.code = code;
    }

    public UsecaseException(String message) {
        this(UsecaseCode.UNKNOWN, message);
    }

    public UsecaseCode getCode() {
        return code;
    }
}
