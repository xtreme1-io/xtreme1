package ai.basic.x1.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
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
public class UserTokenBO {

    private Long id;

    private String token;

    private OffsetDateTime expireAt;

    private OffsetDateTime createdAt;

    private Long createdBy;

    private OffsetDateTime updatedAt;

    private Long updatedBy;

}
