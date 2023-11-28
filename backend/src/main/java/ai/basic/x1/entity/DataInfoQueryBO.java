package ai.basic.x1.entity;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataFormatEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.entity.enums.SplitTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022/4/2 15:06
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoQueryBO extends BaseQueryBO {

    /**
     * Data id
     */
    private List<Long> ids;

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Data name
     */
    private String name;

    /**
     * Data create start time
     */
    private OffsetDateTime createStartTime;

    /**
     * Data create end time
     */
    private OffsetDateTime createEndTime;

    /**
     * Sort field
     */
    private String sortField;

    /**
     * Ascending or descending order
     */
    private String ascOrDesc;

    /**
     * Data annotation status ANNOTATED,NOT_ANNOTATED,INVALID
     */
    private DataAnnotationStatusEnum annotationStatus;

    /**
     * Dataset type LIDAR_FUSION,LIDAR_BASIC,IMAGE
     */
    private DatasetTypeEnum datasetType;


    /**
     * Data split type TRAINING,VALIDATION,TEST,NOT_SPLIT
     */
    private SplitTypeEnum splitType;

    /**
     * Model run record id
     */
    private Long runRecordId;

    /**
     * Min data confidence
     */
    private BigDecimal minDataConfidence;

    /**
     * Max data confidence
     */
    private BigDecimal maxDataConfidence;

    /**
     * Select which models run out of data to export
     */
    private List<Long> selectModelRunIds;

    private Boolean isAllResult;

    /**
     * Parent Id
     */
    private Long parentId;

}
