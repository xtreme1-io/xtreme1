package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.TokenType;
import com.baomidou.mybatisplus.annotation.*;
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
@TableName(autoResultMap = true)
public class UserToken {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String token;

    private TokenType tokenType;

    private OffsetDateTime expireAt;

    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    @TableField(fill = FieldFill.UPDATE)
    private OffsetDateTime updatedAt;

    @TableField(fill = FieldFill.UPDATE)
    private Long updatedBy;
}
