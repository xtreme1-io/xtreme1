package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022/4/8 16:17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetQueryBO {

    /**
     * Dataset name
     */
    private String name;

    /**
     * Dataset create start time
     */
    private OffsetDateTime createStartTime;

    /**
     * Dataset create end time
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
     * Dataset type
     */
    private DatasetTypeEnum type;

}
