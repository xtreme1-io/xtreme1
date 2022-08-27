package ai.basic.x1.entity;

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
public class ModelDataResultBO {

    /**
     * 主键id
     */
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
    private JsonNode modelResult;

    /**
     * 模型序号
     */
    private Long modelSerialNo;

    /**
     * 创建时间
     */
    private OffsetDateTime createdAt;

    /**
     * 创建者
     */
    private Long createdBy;

    /**
     * 更新时间
     */
    private OffsetDateTime updatedAt;

    /**
     * 更新者
     */
    private Long updatedBy;


}