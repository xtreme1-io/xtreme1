package ai.basic.x1.adapter.dto;

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

    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private OffsetDateTime expireAt;

    private OffsetDateTime createdAt;

    private Long createdBy;

    private OffsetDateTime updatedAt;

    private Long updatedBy;

}
