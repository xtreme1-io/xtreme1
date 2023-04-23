package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022-02-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class Dataset implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Dataset name
     */
    private String name;

    /**
     * Dataset type LIDAR_FUSION,LIDAR_BASIC,IMAGE
     */
    private DatasetTypeEnum type;

    /**
     * Dataset description
     */
    private String description;

    /**
     * Is deleted
     */
    private Boolean isDeleted;

    /**
     * Delete unique flag, 0 when writing, set as primary key id after tombstone
     */
    private Long delUniqueKey;

    /**
     * Create time
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;

    /**
     * Creator id
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * Update time
     */
    @TableField(fill = FieldFill.UPDATE)
    private OffsetDateTime updatedAt;

    /**
     * Modify person id
     */
    @TableField(fill = FieldFill.UPDATE)
    private Long updatedBy;

    /**
     * The first 6 data information
     */
    @TableField(exist = false)
    private List<DataInfo> datas;
}
