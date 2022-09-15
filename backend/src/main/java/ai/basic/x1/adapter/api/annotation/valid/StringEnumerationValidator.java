package ai.basic.x1.adapter.api.annotation.valid;

import cn.hutool.core.util.StrUtil;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * @author andy
 */
public class StringEnumerationValidator implements ConstraintValidator<ValidStringEnum, String> {

    private Set<String> enumNames;
    private boolean allowNull;

    private Set<String> getNamesSet(Class<? extends Enum<?>> e) {
        Enum<?>[] enums = e.getEnumConstants();
        String[] names = new String[enums.length];
        for (int i = 0; i < enums.length; i++) {
            names[i] = enums[i].name();
        }
        Set<String> mySet = new HashSet<>(Arrays.asList(names));
        return mySet;
    }

    @Override
    public void initialize(ValidStringEnum validStringEnum) {
        Class<? extends Enum<?>> enumSelected = validStringEnum.enumClass();
        enumNames = getNamesSet(enumSelected);
        allowNull = validStringEnum.allowNull();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {

        if (allowNull && StrUtil.isEmpty(value)) {
            return true;
        } else if (!allowNull && StrUtil.isEmpty(value)) {
            return false;
        } else {
            return enumNames.contains(value);
        }
    }
}
