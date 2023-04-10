package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.entity.enums.SplitTargetDataTypeEnum;
import ai.basic.x1.entity.enums.SplittingByEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoSplitFilterDTO {

    @NotNull(message = "datasetId cannot be null")
    private Long datasetId;

    @ValidStringEnum(message = "targetDataType must be one of SPLIT,NOT_SPLIT", enumClass = SplitTargetDataTypeEnum.class)
    private String targetDataType;

    @Range(min = 1, max = 100, message = "totalSizeRatio is error")
    @NotNull(message = "totalSizeRatio cannot be null")
    private Integer totalSizeRatio;

    @Range(min = 1, max = 100, message = "trainingRatio is error")
    @NotNull(message = "trainingRatio cannot be null")
    private Integer trainingRatio;

    @Range(min = 1, max = 100, message = "validationRatio is error")
    @NotNull(message = "validationRatio cannot be null")
    private Integer validationRatio;

    @Range(min = 1, max = 100, message = "testRatio is error")
    @NotNull(message = "testRatio cannot be null")
    private Integer testRatio;

    @ValidStringEnum(message = "splittingBy must be one of RANDOM,ORDER", enumClass = SplittingByEnum.class)
    @NotEmpty(message = "splittingBy cannot be null")
    private String splittingBy;

    @ValidStringEnum(message = "sortBy must be one of NAME,CREATE_TIME", enumClass = SortByEnum.class)
    private String sortBy;

    @ValidStringEnum(message = "ascOrDesc must be one of ASC,DESC", enumClass = SortEnum.class)
    private String ascOrDesc;
}
