package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.SplitTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelRunFilterDataBO {

    private Integer dataCountRatio;

    /**
     * Exclude the data that already run under this model
     */
    private Boolean isExcludeModelData;

    /**
     * Split type
     */
    private SplitTypeEnum splitType;

    /**
     * Data annotation status
     */
    private DataAnnotationStatusEnum annotationStatus;
}
