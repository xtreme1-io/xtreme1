package ai.basic.x1.adapter.port.dao.mybatis.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022-11-30
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetSixData {

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Data IDs separated by commas
     */
    private String dataIds;
}
