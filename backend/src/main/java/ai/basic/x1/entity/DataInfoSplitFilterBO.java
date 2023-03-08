package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.SortByEnum;
import ai.basic.x1.entity.enums.SortEnum;
import ai.basic.x1.entity.enums.SplitTargetDataTypeEnum;
import ai.basic.x1.entity.enums.SplittingByEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoSplitFilterBO {

    private Long datasetId;

    private SplitTargetDataTypeEnum targetDataType;

    private Integer totalSizeRatio;

    private Integer trainingRatio;

    private Integer validationRatio;

    private Integer testRatio;

    private SplittingByEnum splittingBy;

    private SortByEnum sortBy;

    private SortEnum ascOrDesc;
}
