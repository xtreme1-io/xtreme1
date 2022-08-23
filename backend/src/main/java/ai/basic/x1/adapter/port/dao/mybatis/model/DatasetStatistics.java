package ai.basic.x1.adapter.port.dao.mybatis.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetStatistics {

    /**
     * 数据集ID
     */
    private Long datasetId;

    /**
     * 已经标注数量
     */
    private Integer annotatedCount;

    /**
     * 未标注数量
     */
    private Integer notAnnotatedCount;

    /**
     * 无效数据标注数量
     */
    private Integer invalidCount;
}
