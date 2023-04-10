package ai.basic.x1.entity;

import ai.basic.x1.adapter.port.dao.mybatis.model.ModelRunFilterData;
import ai.basic.x1.entity.enums.RunRecordTypeEnum;
import ai.basic.x1.entity.enums.RunStatusEnum;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * @author fyvb
 * @version 1.0
 * @date 2022/3/1
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelRunRecordBO {

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
     * Error reason
     */
    private String errorReason;

    /**
     * metrics
     */
    private JSONObject  metrics;

    /**
     * Run parameters
     */
    private JSONObject resultFilterParam;

    /**
     * Filter data parameters
     */
    private ModelRunFilterDataBO dataFilterParam;

    /**
     * Model serial no
     */
    private Long modelSerialNo;

    /**
     * Whether to delete
     */
    private Boolean isDeleted;

    /**
     * Create time
     */
    private OffsetDateTime createdAt;

    /**
     * Creator id
     */
    private Long createdBy;

    /**
     * Update time
     */
    private OffsetDateTime updatedAt;

    /**
     * Modify person id
     */
    private Long updatedBy;

    private String datasetName;

    private BigDecimal completionRate;
}
