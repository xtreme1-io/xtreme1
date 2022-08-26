package ai.basic.x1.usecase.exception;

/**
 * @author Jagger Wang
 */
public enum UsecaseCode {

    // Common
    OK("OK", "OK"),
    UNKNOWN("UNKNOWN", "Unknown error"),
    NOT_FOUND("NOT_FOUND", "Resource not found"),
    DUPLICATED("DUPLICATED", "Resource duplicated"),
    PARAM_ERROR("PARAM_ERROR", "Param error"),

    NAME_DUPLICATED("NAME_DUPLICATED","name already exists"),

    // User
    USERNAME_AND_PASSWORD_NOT_MATCH("USERNAME_AND_PASSWORD_NOT_MATCH", "Username and password not match"),

    LOGIN_STATUS_TIMEOUT("LOGIN_STATUS_TIMEOUT", "User login status timeout"),

    // Dataset
    DATASET_NAME_DUPLICATED("DATASET_NAME_DUPLICATED", "Dataset duplicate name"),

    FILE_URL_ERROR("FILE_URL_ERROR", "File url error"),

    DATASET_NOT_FOUND("DATASET_NOT_FOUND", "Dataset not found");

    // Storage

    /**
     * 枚举编码
     */
    private String code;

    /**
     * 枚举描述
     */
    private String message;

    UsecaseCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public static UsecaseCode getUsecaseCode(String code) {
        for (UsecaseCode usecaseCode : UsecaseCode.values()) {
            if (usecaseCode.getCode() == code) {
                return usecaseCode;
            }
        }
        throw new IllegalArgumentException("Param val mismatch.");
    }


    public String getMessage() {
        return message;
    }

    public String getCode() {
        return code;
    }

}
