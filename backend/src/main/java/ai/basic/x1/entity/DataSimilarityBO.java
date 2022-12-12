package ai.basic.x1.entity;

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
public class DataSimilarityBO {
    private Long id;
    private String attributeId;
    private String  optionName;
    private List<List<String>>  optionPaths;
    private Integer optionCount;
}
