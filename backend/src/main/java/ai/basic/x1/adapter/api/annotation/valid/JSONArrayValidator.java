package ai.basic.x1.adapter.api.annotation.valid;

import cn.hutool.core.util.StrUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.List;

/**
 * @author andy
 */
public class JSONArrayValidator implements ConstraintValidator<ValidJSONArray, String> {
    public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private boolean allowNull;

    @Override
    public void initialize(ValidJSONArray validJSONArray) {
        allowNull = validJSONArray.allowNull();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        try {
            if (allowNull && StrUtil.isEmpty(value)) {
                return true;
            } else if (!allowNull && StrUtil.isEmpty(value)) {
                return false;
            } else {
                OBJECT_MAPPER.readValue(value, List.class);
                return true;
            }
        } catch (JsonProcessingException e) {
            return false;
        }
    }

}
