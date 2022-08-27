package ai.basic.x1.util;

import ai.basic.x1.adapter.exception.ApiException;
import ai.basic.x1.usecase.exception.UsecaseCode;
import org.springframework.http.HttpStatus;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import java.util.Set;


/**
 * hibernate validator的校验工具
 */
public class ValidateUtil {

    private static final Validator validator =
            Validation.buildDefaultValidatorFactory().getValidator();

    /**
     * 校验实体类
     */
    public static <T> void validate(T t) {
        Set<ConstraintViolation<T>> constraintViolations = validator.validate(t);
        if (constraintViolations.size() > 0) {
            StringBuilder validateError = new StringBuilder();
            for (ConstraintViolation<T> constraintViolation : constraintViolations) {
                String message = constraintViolation.getPropertyPath() + ":" + constraintViolation.getMessage();
                validateError.append(message).append(";");
            }
            throw new ApiException(HttpStatus.BAD_REQUEST, UsecaseCode.PARAM_ERROR, validateError.toString());
        }
    }

    /**
     * 通过组来校验实体类
     */
    public static <T> void validate(T t, Class<?>... groups) {
        Set<ConstraintViolation<T>> constraintViolations = validator.validate(t, groups);
        if (constraintViolations.size() > 0) {
            StringBuilder validateError = new StringBuilder();
            for (ConstraintViolation<T> constraintViolation : constraintViolations) {
                String message = constraintViolation.getPropertyPath() + ":" + constraintViolation.getMessage();
                validateError.append(message).append(";");
            }
            throw new ApiException(HttpStatus.BAD_REQUEST, UsecaseCode.PARAM_ERROR, validateError.toString());
        }
    }
}