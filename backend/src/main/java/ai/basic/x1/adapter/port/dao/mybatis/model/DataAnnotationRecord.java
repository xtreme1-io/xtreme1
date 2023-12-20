package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.ItemTypeEnum;
import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-05-07 16:30:56
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class DataAnnotationRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Dataset id
     */
    private Long datasetId;

    private ItemTypeEnum itemType;

    /**
     * Serial number
     */
    private Long serialNo;

    /**
     * Creator id
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * Create time
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

}