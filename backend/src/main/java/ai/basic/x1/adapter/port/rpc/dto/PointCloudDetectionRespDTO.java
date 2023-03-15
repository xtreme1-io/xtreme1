package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author andy
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointCloudDetectionRespDTO {
    private Long id;
    private String code;
    private String message;
    private List<PointCloudDetectionObject> objects;

    private BigDecimal confidence;
}
