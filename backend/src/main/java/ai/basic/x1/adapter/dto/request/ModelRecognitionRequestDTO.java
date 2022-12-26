package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.adapter.dto.PreModelParamDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * @author zhujh
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelRecognitionRequestDTO {

    @NotNull(message = "not allow null")
    private Long dataId;

    @Range(min = 0, max = 1, message = "confidence is error")
    private BigDecimal minConfidence;

    @Range(min = 0, max = 1, message = "confidence is error")
    private BigDecimal maxConfidence;

    @NotEmpty(message = "classes not empty")
    private List<String> classes;

    public PreModelParamDTO toPreModelParamDTO() {
        return PreModelParamDTO.builder()
                .classes(classes)
                .maxConfidence(maxConfidence)
                .minConfidence(minConfidence)
                .build();
    }

}
