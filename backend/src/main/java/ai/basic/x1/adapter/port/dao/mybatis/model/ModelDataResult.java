package ai.basic.x1.adapter.port.dao.mybatis.model;

import cn.hutool.json.JSON;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022-05-11 19:55:20
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(autoResultMap = true)
public class ModelDataResult {

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
     * Dataset id
     */
    private Long datasetId;
    /**
     * Data id
     */
    private Long dataId;
    /**
     * Model results filtering parameters
     */
    private String resultFilterParam;
    /**
     * The result returned by running the model
     */
    @TableField(value = "model_result", typeHandler = JacksonTypeHandler.class)
    private JSONObject modelResult;
    /**
     * Model serial number
     */
    private Long modelSerialNo;
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

}