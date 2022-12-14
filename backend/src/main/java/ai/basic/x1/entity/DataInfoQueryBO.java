package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

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

}
