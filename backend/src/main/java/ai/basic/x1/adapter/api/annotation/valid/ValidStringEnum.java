package ai.basic.x1.adapter.api.annotation.valid;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.RUNTIME;


/**
 * @author andy
 */
@Documented
@Constraint(validatedBy = StringEnumerationValidator.class)
@Target({METHOD, FIELD, ANNOTATION_TYPE, PARAMETER, CONSTRUCTOR})
@Retention(RUNTIME)
public @interface ValidStringEnum {
    String message() default "{ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum.message}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    Class<? extends Enum<?>> enumClass();

    boolean allowNull() default true;

}

