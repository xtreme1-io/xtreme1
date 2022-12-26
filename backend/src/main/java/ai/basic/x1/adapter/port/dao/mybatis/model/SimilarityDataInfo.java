package ai.basic.x1.adapter.port.dao.mybatis.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author andy
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimilarityDataInfo {
    private List<Long> fullDataIds;
    private List<Long> addDataIds;
    private List<Long> deletedIds;
}
