package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.SplitTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.groups.Default;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelRunFilterDataDTO {

    @NotNull(message = "not allow null", groups = {ModelRunGroup.class})
    private Integer dataCountRatio;

    @NotNull(message = "not allow null")
    private Boolean isExcludeModelData;

    @ValidStringEnum(message = "splitType must be one of TRAINING,VALIDATION,TEST,NOT_SPLIT", enumClass = SplitTypeEnum.class)
    private String splitType;

    @ValidStringEnum(message = "annotationStatus must be one of ANNOTATED, NOT_ANNOTATED, INVALID", enumClass = DataAnnotationStatusEnum.class)
    private String annotationStatus;

    public interface ModelRunGroup extends Default {
    }
}
