package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

/**
 * @author andy
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PointCloudDetectionObject {

    private String label;
    private BigDecimal confidence;
    private BigDecimal x;
    private BigDecimal y;
    private BigDecimal z;
    private BigDecimal dx;
    private BigDecimal dy;
    private BigDecimal dz;
    private BigDecimal rotX;
    private BigDecimal rotY;
    private BigDecimal rotZ;

}
