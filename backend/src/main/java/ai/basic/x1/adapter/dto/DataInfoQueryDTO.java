package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * @author fyb
 * @date 2022/2/23 9:40
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoQueryDTO {

    /**
     * Data id
     */
    private List<Long> ids;

    /**
     * Dataset id
     */
    @NotNull(message = "datasetId cannot be null")
    private Long datasetId;


    private Long parentId;

    /**
     * Data name
     */
    private String name;

    /**
     * Data create start time
     */
    private String createStartTime;

    /**
     * Data create end time
     */
    private String createEndTime;

    /**
     * Sort field
     */
    @ValidStringEnum(message = "sort field must be one of NAME,CREATED_AT,DATA_CONFIDENCE", enumClass = DataInfoSortFieldEnum.class)
    private String sortField;

    /**
     * Ascending or descending order
     */
    @ValidStringEnum(message = "ascOrDesc must be one of ASC,DESC", enumClass = SortEnum.class)
    private String ascOrDesc;

    /**
     * Data annotation status ANNOTATED,NOT_ANNOTATED,INVALID
     */
    @ValidStringEnum(message = "annotationStatus must be one of ANNOTATED, NOT_ANNOTATED, INVALID", enumClass = DataAnnotationStatusEnum.class)
    private String annotationStatus;

    /**
     * Data format XTREME1,COCO
     */
    @ValidStringEnum(message = "dataFormat must be one of XTREME1,COCO", enumClass = DataFormatEnum.class)
    private String dataFormat;

    /**
     * Data split type TRAINING,VALIDATION,TEST,NOT_SPLIT
     */
    @ValidStringEnum(message = "splitType must be one of TRAINING,VALIDATION,TEST,NOT_SPLIT", enumClass = SplitTypeEnum.class)
    private String splitType;

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

}
