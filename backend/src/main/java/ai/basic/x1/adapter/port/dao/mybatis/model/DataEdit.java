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
     * 标注记录表
     */
    private Long annotationRecordId;
    /**
     * 数据id
     */
    private Long dataId;
    /**
     * 数据集id
     */
    private Long datasetId;
    /**
     * 模型id
     */
    private Long modelId;
    /**
     * 模型版本
     */
    private String modelVersion;
    /**
     * 创建者
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;
}