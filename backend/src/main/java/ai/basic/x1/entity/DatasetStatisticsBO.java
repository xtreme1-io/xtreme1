package ai.basic.x1.entity;

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
public class DatasetStatisticsBO {

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
     * Data count
     */
    private Integer itemCount;

    public Integer getItemCount() {

        return annotatedCount + notAnnotatedCount + invalidCount;
    }

    public static DatasetStatisticsBO createEmpty(Long datasetId) {
        return DatasetStatisticsBO.builder()
                .datasetId(datasetId)
                .annotatedCount(0)
                .notAnnotatedCount(0)
                .invalidCount(0)
                .itemCount(0)
                .build();
    }

}
