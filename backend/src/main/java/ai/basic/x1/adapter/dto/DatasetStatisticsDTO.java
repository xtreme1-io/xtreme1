package ai.basic.x1.adapter.dto;

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
public class DatasetStatisticsDTO {

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Annotated data count
     */
    private Integer annotatedCount;

    /**
     * Not annotate data count
     */
    private Integer notAnnotatedCount;

    /**
     * Invalid data count
     */
    private Integer invalidCount;

    /**
     * annotate count
     */
    private Integer objectCount;

    private Integer itemCount;

}
