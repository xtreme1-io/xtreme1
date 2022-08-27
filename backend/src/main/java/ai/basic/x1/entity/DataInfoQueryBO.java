package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DataAnnotationStatusEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * @author fyb
 * @date 2022/4/2 15:06
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoQueryBO extends BaseQueryBO {

    /**
     * 数据集ID
     */
    private Long datasetId;

    /**
     * 数据名称
     */
    private String name;

    /**
     * 创建开始时间
     */
    private OffsetDateTime createStartTime;

    /**
     * 创建结束时间
     */
    private OffsetDateTime createEndTime;

    /**
     * 排序字段
     */
    private String sortField;

    /**
     * 排序规则 升序或者降序 asc、desc
     */
    private String ascOrDesc;

    /**
     * 数据标注状态 ANNOTATED,NOT_ANNOTATED,INVALID
     */
    private DataAnnotationStatusEnum annotationStatus;

    /**
     * Dataset type
     */
    private DatasetTypeEnum datasetType;

}
