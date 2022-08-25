package ai.basic.x1.adapter.api.annotation.valid;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.RUNTIME;


@Documented
@Constraint(validatedBy = JSONArrayValidator.class)
@Target({METHOD, FIELD, ANNOTATION_TYPE, PARAMETER, CONSTRUCTOR})
@Retention(RUNTIME)
public @interface ValidJSONArray {
    String message() default "{ai.basic.basicai.common.adapter.api.annotation.valid.ValidJSONArray.message}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    boolean allowNull() default true;
}

