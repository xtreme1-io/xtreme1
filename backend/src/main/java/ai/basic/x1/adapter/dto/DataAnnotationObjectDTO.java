package ai.basic.x1.adapter.dto;

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

    /**
     * 数据集ID
     */
    private Long datasetId;

    /**
     * 数据ID
     */
    private Long dataId;

    /**
     * 类型ID
     */
    private Long classId;


    /**
     * 对象标注属性
     */
    private JSONObject classAttributes;

    private Integer objectCount;

    private String frontId;
}
