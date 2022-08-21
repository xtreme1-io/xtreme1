package ai.basic.x1community.adapter.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Jagger Wang
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginRequestDTO {

    private String username;

    private String password;

}
