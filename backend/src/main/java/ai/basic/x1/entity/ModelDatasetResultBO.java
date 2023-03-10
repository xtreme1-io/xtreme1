package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * @author chenchao
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelDatasetResultBO {

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
    private String resultFilterParam;

    /**
     * Model result
     */
    private String modelResult;

    /**
     * Data confidence
     */
    private BigDecimal dataConfidence;

    /**
     * Whether it is successful.
     */
    private Boolean isSuccess;

    /**
     * Error message
     */
    private String errorMessage;

    /**
     * Model serial no
     */
    private Long modelSerialNo;

    /**
     * create time
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
}
