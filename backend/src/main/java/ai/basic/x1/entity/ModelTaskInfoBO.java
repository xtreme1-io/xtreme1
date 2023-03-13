package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ModelTaskInfoBO {
    /**
     * successful returns 0; failure returns -1.
     */
    private String code;
    private String message;

    private BigDecimal confidence;
}
