package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataInfoSortFieldEnum;
import ai.basic.x1.entity.enums.SortEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
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
    @ValidStringEnum(message = "sort field must be one of NAME,CREATED_AT", enumClass = DataInfoSortFieldEnum.class)
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

}
