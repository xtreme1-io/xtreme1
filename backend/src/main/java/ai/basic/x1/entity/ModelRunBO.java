package ai.basic.x1.entity;

import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelRunBO {

    private Long datasetId;
    private Long modelId;
    private JSONObject resultFilterParam;

    private ModelRunFilterDataBO dataFilterParam;
}
