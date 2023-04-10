package ai.basic.x1.adapter.port.dao.mybatis.model;

import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * @author fyb
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class ModelDatasetResult {

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
     * Model run record id
     */
    private Long runRecordId;

    /**
     * Model run no
     */
    private String runNo;


    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Data id
     */
    private Long dataId;

    /**
     * Run parameters
     */
    @TableField(value = "result_filter_param", typeHandler = JacksonTypeHandler.class)
    private JSONObject resultFilterParam;

    /**
     * Model result
     */
    @TableField(value = "model_result", typeHandler = JacksonTypeHandler.class)
    private JSONObject modelResult;

    /**
     * Data confidence
     */
    private BigDecimal dataConfidence;

    /**
     * Model serial no
     */
    private Long modelSerialNo;

    /**
     * Whether it is successful.
     */
    private Boolean isSuccess;

    /**
     * Error message
     */
    private String errorMessage;

    /**
     * create time
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
}
