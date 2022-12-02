package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.TokenType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author zhujh
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTokenDTO {

    private Long id;

    private String token;

    private TokenType tokenType;

    private OffsetDateTime expireAt;

    private OffsetDateTime createdAt;

    private Long createdBy;

    private OffsetDateTime updatedAt;

    private Long updatedBy;

}
