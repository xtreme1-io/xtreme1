package ai.basic.x1.adapter.port.rpc.dto;

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
public class PreModelParam {
    private BigDecimal confidence;
}
