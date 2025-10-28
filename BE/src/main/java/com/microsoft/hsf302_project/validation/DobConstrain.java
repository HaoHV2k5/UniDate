package com.microsoft.hsf302_project.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;


@Constraint(validatedBy = {DobValidator.class })
@Target({  FIELD})
@Retention(RUNTIME)

public @interface DobConstrain {
    String message() default "{INVALID_DOB}";
    int min();
    Class<?>[] groups() default { };

    Class<? extends Payload>[] payload() default { };

}
