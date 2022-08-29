package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreModelParamBO {
    private BigDecimal minConfidence;
    private BigDecimal maxConfidence;
    private List<String> classes;
}
