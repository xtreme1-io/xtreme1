package ai.basic.x1.entity;

import cn.hutool.json.JSONArray;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationResultBO {

    /**
     *
     */
    private Long id;

    /**
     * 数据ID
     */
    private Long dataId;

    /**
     * Classification 属性取值
     */
    private List<DataAnnotationClassificationBO> classificationValues;

    /**
     * Data 包含的 Object 列表
     */
    private List<DataAnnotationObjectBO> objects;

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


}