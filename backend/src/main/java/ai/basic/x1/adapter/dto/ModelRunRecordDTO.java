package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.dto.request.ModelRunFilterDataDTO;
import ai.basic.x1.entity.ModelRunFilterDataBO;
import ai.basic.x1.entity.enums.RunRecordTypeEnum;
import ai.basic.x1.entity.enums.RunStatusEnum;
import cn.hutool.json.JSONObject;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
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
public class ModelRunRecordDTO {

    @NotNull(message = "not allow null")
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
    private JSONObject  metrics;

    /**
     * Error reason
     */
    private String errorReason;

    /**
     * Run parameters
     */
    private JSONObject resultFilterParam;

    /**
     * Filter data parameters
     */
    private ModelRunFilterDataDTO dataFilterParam;

    /**
     * Model serial no
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long modelSerialNo;

    /**
     * Whether to delete
     */
    private Boolean isDeleted;
    /**
     * Creation time
     */
    private OffsetDateTime createdAt;
    /**
     * Create user id
     */
    private Long createdBy;
    /**
     * Update time
     */
    private OffsetDateTime updatedAt;
    /**
     * Update user id
     */
    private Long updatedBy;

    private String datasetName;

    /**
     * Model processing progress
     */
    private BigDecimal completionRate;
}
