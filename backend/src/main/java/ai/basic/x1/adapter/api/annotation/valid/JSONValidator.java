package ai.basic.x1.adapter.api.annotation.valid;

import cn.hutool.core.util.StrUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

/**
 * @author andy
 */
public class JSONValidator implements ConstraintValidator<ValidJSON, String> {

    public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private boolean allowNull;

    @Override
    public void initialize(ValidJSON validJSON) {
        allowNull = validJSON.allowNull();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        try {
            if (allowNull && StrUtil.isEmpty(value)) {
                return true;
            } else if (!allowNull && StrUtil.isEmpty(value)) {
                return false;
            } else {
                OBJECT_MAPPER.readTree(value);
                return true;
            }
        } catch (JsonProcessingException e) {
            return false;
        }
    }

}
