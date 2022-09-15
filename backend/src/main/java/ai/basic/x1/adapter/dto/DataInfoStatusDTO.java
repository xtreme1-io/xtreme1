package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoStatusDTO {

    /**
     * Data id
     */
    private Long id;

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Data name
     */
    private String name;

    /**
     * Data status INVALID,VALID
     */
    private DataStatusEnum status;

    /**
     * Data annotation status ANNOTATED, NOT_ANNOTATED, INVALID
     */
    private DataAnnotationStatusEnum annotationStatus;

}
