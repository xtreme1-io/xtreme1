package ai.basic.x1.adapter.api.filter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * @author Jagger Wang
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtPayload {

    private Long userId;

    private Date expireTime;

}
