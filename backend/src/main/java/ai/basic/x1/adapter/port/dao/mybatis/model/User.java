package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.UserBO;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;

/**
 * @author Jagger Wang
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    private String password;

    private String nickname;

    private Long avatarId;

    private OffsetDateTime lastLoginAt;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    public static User fromBO(UserBO bo) {
        return User.builder()
                .id(bo.getId())
                .username(bo.getUsername())
                .password(bo.getPassword())
                .nickname(bo.getNickname())
                .avatarId(bo.getAvatarId())
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
