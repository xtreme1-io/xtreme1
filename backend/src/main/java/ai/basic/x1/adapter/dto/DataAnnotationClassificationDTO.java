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
public class DataAnnotationClassificationDTO {


    private Long id;

    private Long datasetId;

    private Long dataId;

    private Long classificationId;

    private JSONObject classificationAttributes;
}
