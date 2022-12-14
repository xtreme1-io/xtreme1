package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.adapter.dto.PreModelParamDTO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
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

    @ValidStringEnum(message = "modelCode must be one of PRE_LABEL,COCO_80", enumClass = ModelCodeEnum.class)
    private String modelCode;

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
