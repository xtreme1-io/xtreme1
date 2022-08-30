package ai.basic.x1.usecase.exception;

/**
 * @author Jagger Wang
 */
public enum UsecaseCode {

    // Common
    OK("OK", "OK"),
    ERROR("ERROR", "Service error"),
    UNKNOWN("UNKNOWN", "Unknown error"),
    NOT_FOUND("NOT_FOUND", "Resource not found"),
    DUPLICATED("DUPLICATED", "Resource duplicated"),
    PARAM_ERROR("PARAM_ERROR", "Param error"),

    NAME_DUPLICATED("NAME_DUPLICATED","name already exists"),

    // User
    USERNAME_AND_PASSWORD_NOT_MATCH("USERNAME_AND_PASSWORD_NOT_MATCH", "Username and password not match"),

    LOGIN_STATUS_TIMEOUT("LOGIN_STATUS_TIMEOUT", "User login status timeout"),

    USER_EXIST("USER_EXIST", "User already existed"),

    FILE_TYPE_NOT_SUPPORT("FILE_TYPE_NOT_SUPPORT", "File type not support"),

    // Dataset
    DATASET_NAME_DUPLICATED("DATASET_NAME_DUPLICATED", "Dataset duplicate name"),

    FILE_URL_ERROR("FILE_URL_ERROR", "File url error"),

    DATASET_NOT_FOUND("DATASET_NOT_FOUND", "Dataset not found"),

    DATASET__DATA__DATA_HAS_BEEN_UNLOCKED("DATASET__DATA_DATA_HAS_BEEN_UNLOCKED", "The data has been unlocked"),

    DATASET_DATA_OTHERS_ANNOTATING("DATASET_DATA_OTHERS_ANNOTATING","Select data that others are annotating"),

    DATASET_DATA_UNLOCK_ID_ERROR("DATASET__DATA__UNLOCK_ID_ERROR", "Please pass in the correct unlock id"),

    DATASET_DATA_EXIST_ANNOTATE("DATASET_DATA_EXIST_ANNOTATE", "The selected data is being marked by others"),

    MODEL_DOES_NOT_EXIST("MODEL_DOES_NOT_EXIST","Model does not exist");

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
