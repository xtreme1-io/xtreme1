package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * @author andy
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointBO {
    private BigDecimal x;
    private BigDecimal y;
    private BigDecimal z;
}
