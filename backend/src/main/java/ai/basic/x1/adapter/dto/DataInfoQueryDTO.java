package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DataInfoSortFieldEnum;
import ai.basic.x1.entity.enums.SortEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

/**
 * @author fyb
 * @date 2022/2/23 9:40
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoQueryDTO {

    /**
     * 数据集ID
     */
    @NotNull(message = "datasetId cannot be null")
    private Long datasetId;

    /**
     * 数据名称
     */
    private String name;

    /**
     * 创建开始时间
     */
    private String createStartTime;

    /**
     * 创建结束时间
     */
    private String createEndTime;

    /**
     * 排序字段
     */
    @ValidStringEnum(message = "sort field must be one of NAME,CREATED_AT", enumClass = DataInfoSortFieldEnum.class)
    private String sortField;

    /**
     * 升序或者降序
     */
    @ValidStringEnum(message = "ascOrDesc must be one of ASC,DESC", enumClass = SortEnum.class)
    private String ascOrDesc;

    /**
     * 数据标注状态 ANNOTATED,NOT_ANNOTATED,INVALID
     */
    private DataAnnotationStatusEnum annotationStatus;

}
