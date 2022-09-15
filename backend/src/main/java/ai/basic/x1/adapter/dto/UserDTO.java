package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.UserBO;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class UserDTO {

    private Long id;

    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String nickname;

    private Long avatarId;

    private String avatarUrl;

    private OffsetDateTime lastLoginAt;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    public static UserDTO fromBO(UserBO bo) {
        return UserDTO.builder()
                .id(bo.getId())
                .username(bo.getUsername())
                .nickname(bo.getNickname())
                .avatarId(bo.getAvatarId())
                .avatarUrl(bo.getAvatarUrl())
                .lastLoginAt(bo.getLastLoginAt())
                .createdAt(bo.getCreatedAt())
                .updatedAt(bo.getUpdatedAt())
                .build();
    }

    public UserBO toBO() {
        return UserBO.builder()
                .id(id)
                .username(username)
                .password(password)
                .nickname(nickname)
                .avatarId(avatarId)
                .lastLoginAt(lastLoginAt)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }

}
