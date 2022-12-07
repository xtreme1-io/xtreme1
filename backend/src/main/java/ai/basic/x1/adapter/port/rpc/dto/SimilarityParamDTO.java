package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author andy
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimilarityParamDTO {
    private Long datasetId;
    private String serialNumber;
    private String filePath;
    private String type;
}
