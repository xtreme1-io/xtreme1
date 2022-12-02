package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointCloudRange {
    private BigDecimal left;
    private BigDecimal top;
    private BigDecimal right;
    private BigDecimal bottom;
}
