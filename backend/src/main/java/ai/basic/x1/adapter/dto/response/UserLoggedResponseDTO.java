package ai.basic.x1.adapter.dto.response;

import ai.basic.x1.adapter.dto.UserDTO;
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
public class UserLoggedResponseDTO {

    private UserDTO user;

}