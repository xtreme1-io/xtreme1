package ai.basic.x1.adapter.port.dao.mybatis.model;

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
public class DatasetStatistics {

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
}
