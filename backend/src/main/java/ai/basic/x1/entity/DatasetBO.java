package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022/2/16 14:10
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetBO {

    private Long id;

    /**
     * 数据集名称
     */
    private String name;

    /**
     * 数据类型
     */
    private DatasetTypeEnum type;

    /**
     * 描述
     */
    private String description;

    /**
     * data数量
     */
    private Long itemCount;

    /**
     * 标注数量
     */
    private Long annotationCount;

    /**
     * class数量
     */
    private Long classCount;

    /**
     * 团队ID
     */
    private Long  teamId;

    /**
     * 是否删除 1：是 0：否
     */
    private Boolean isDeleted;

    /**
     * 创建时间
     */
    private OffsetDateTime createdAt;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 更新时间
     */
    private OffsetDateTime updatedAt;

    /**
     * 更改人ID
     */
    private Long updatedBy;

    /**
     * 删除时间
     */
    private OffsetDateTime deletedAt;

    /**
     * 删除人ID
     */
    private Long  deletedBy;

    private List<DataInfoBO> datas;

    private Integer notAnnotatedDataCount;

    private Integer annotatedDataCount;

    private Integer invalidDataCount;

}
