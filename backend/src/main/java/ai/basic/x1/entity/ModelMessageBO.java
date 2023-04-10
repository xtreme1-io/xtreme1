package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ModelCodeEnum;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * @author fyb
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ModelMessageBO {

    private ModelCodeEnum modelCode;

    private Long datasetId;

    private Long dataId;

    private Long modelId;

    private String modelVersion;

    private Long modelSerialNo;

    private Long createdBy;

    private JSONObject resultFilterParam;

    private String modelRunParam;

    private DataInfoBO dataInfo;

    private String url;

}
