package ai.basic.x1.adapter.port.dao.mybatis.model;

import ai.basic.x1.entity.ModelRunFilterDataBO;
import ai.basic.x1.entity.enums.RunRecordTypeEnum;
import ai.basic.x1.entity.enums.RunStatusEnum;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @version 1.0
 * @date 2023/3/1
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class ModelRunRecord {

    @TableId(type = IdType.AUTO)
    private Long id;
    /**
     * Model id
     */
    private Long modelId;

    /**
     * Model version
     */
    private String modelVersion;

    /**
     * Model run no
     */
    private String runNo;

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Model run status
     */
    private RunStatusEnum status;

    /**
     * Model run record type
     */
    private RunRecordTypeEnum runRecordType;

    /**
     * Data count
     */
    private Long dataCount;

    /**
     * metrics
     */
    @TableField(value = "metrics", typeHandler = JacksonTypeHandler.class)
    private JSONObject  metrics;

    /**
     * Error reason
     */
    private String errorReason;

    /**
     * Run parameters
     */
    @TableField(value = "result_filter_param", typeHandler = JacksonTypeHandler.class)
    private JSONObject resultFilterParam;

    /**
     * Filter data parameters
     */
    @TableField(value = "data_filter_param", typeHandler = JacksonTypeHandler.class)
    private ModelRunFilterData dataFilterParam;

    /**
     *  Model serial no
     */
    private Long modelSerialNo;

    /**
     * Whether to delete
     */
    private Boolean isDeleted;

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

    @TableField(exist = false)
    private String datasetName;

    @TableField(exist = false)
    private Long runCount;
}
