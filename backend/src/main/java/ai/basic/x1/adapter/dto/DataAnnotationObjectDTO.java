package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.DataAnnotationObjectSourceTypeEnum;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationObjectDTO {

    private Long id;

    private Long datasetId;

    private Long dataId;

    private Long classId;

    private JSONObject classAttributes;

    private Long sourceId;

    private DataAnnotationObjectSourceTypeEnum sourceType;

    private Integer objectCount;

    private String frontId;

    /**
     * Locked Person's Name
     */
    private String lockedBy;
}
