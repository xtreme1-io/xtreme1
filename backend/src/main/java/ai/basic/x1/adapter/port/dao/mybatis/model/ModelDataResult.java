package ai.basic.x1.adapter.port.dao.mybatis.model;

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
     * 模型id
     */
    private Long modelId;
    /**
     * 模型版本
     */
    private String modelVersion;
    /**
     * 数据集id
     */
    private Long datasetId;
    /**
     * 数据id
     */
    private Long dataId;
    /**
     * 模型过滤参数
     */

    private String resultFilterParam;
    /**
     * 模型结果
     */
    @TableField(value = "model_result", typeHandler = JacksonTypeHandler.class)
    private JsonNode modelResult;

    private Long modelSerialNo;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private OffsetDateTime createdAt;
    /**
     * 创建者
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.UPDATE)
    private OffsetDateTime updatedAt;
    /**
     * 更新者
     */
    @TableField(fill = FieldFill.UPDATE)
    private Long updatedBy;

}