package ai.basic.x1.adapter.dto;

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
public class DataSimilarityDTO {
    private Long id;
    private String attributeId;
    private String optionName;
    private List<List<String>> optionPaths;
    private Integer optionCount;
}
