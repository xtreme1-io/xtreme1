package ai.basic.x1.adapter.port.dao.mybatis.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-05-07 16:31:31
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class DataEdit {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Data annotation record id
     */
    private Long annotationRecordId;

    /**
     * Scene id
     */
    private Long sceneId;
    /**
     * Data id
     */
    private Long dataId;
    /**
     * Dataset id
     */
    private Long datasetId;
    /**
     * Model id
     */
    private Long modelId;
    /**
     * Model version
     */
    private String modelVersion;
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

    /**
     * Locked num
     */
    @TableField(exist = false)
    private Long lockedNum;
}