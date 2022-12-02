package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointCloudCRRespDTO {
    private Integer code;
    private String message;
    private Long imageSize;
    private Long binaryPcdSize;
    private PointCloudRange pointCloudRange;

}
