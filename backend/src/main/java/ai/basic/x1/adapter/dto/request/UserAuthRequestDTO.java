package ai.basic.x1.adapter.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Pattern;

/**
 * @author Jagger Wang、Zhujh
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthRequestDTO {

    public static final String PASSWORD_REGEX = "(?=[^a-zA-Z]*[a-zA-Z])(?=\\D*\\d).{8,64}";
    public static final String PASSWORD_ERROR = "must contains one letter, number, and " +
            "length 8-64";

    @Pattern(regexp = "^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$", message = "must be " +
            "email format")
    private String username;

    @Pattern(regexp = PASSWORD_REGEX, message = PASSWORD_ERROR)
    private String password;

}
