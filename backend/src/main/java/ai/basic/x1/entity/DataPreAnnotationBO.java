package ai.basic.x1.entity;

import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataPreAnnotationBO {

    private Long datasetId;

    private List<Long> dataIds;

    private Long modelId;

    private String modelVersion;

    private String modelCode;

    private JSONObject resultFilterParam;

    private Boolean isFilterData;

}
