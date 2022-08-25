package ai.basic.x1.adapter.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

/**
 * @author Zhujh
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequestDTO {

    @NotNull(message = "avatarId can not null")
    private Long avatarId;

    @Pattern(regexp = UserAuthRequestDTO.PASSWORD_REGEX, message = UserAuthRequestDTO.PASSWORD_ERROR)
    private Long newPassword;
}
