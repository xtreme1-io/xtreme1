package ai.basic.x1community.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author Jagger Wang
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBO {

    public enum Status {
        // 正常
        NORMAL,
        // 禁用
        FORBIDDEN
    }

    private Long id;

    private String username;

    private String password;

    private String nickname;

    private Long avatarId;

    private OffsetDateTime lastLoginAt;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

}