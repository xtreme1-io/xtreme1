package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.DataSimilarityBO;
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
public class DatasetSimilarityDTO {
    private List<String> options;
    private List<DataSimilarityBO> dataSimilarityList;
}
