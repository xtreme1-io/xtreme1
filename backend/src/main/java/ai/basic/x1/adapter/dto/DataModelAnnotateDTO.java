package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.ItemTypeEnum;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataModelAnnotateDTO {

    /**
     * Dataset id
     */
    @NotNull(message = "not allow null")
    private Long datasetId;

    private ItemTypeEnum operateItemType;

    /**
     * Data id collection
     */
    @NotEmpty(message = "not allow null")
    private List<Long> dataIds;

    /**
     * Model code LIDAR_DETECTION,IMAGE_DETECTION
     */
    @ValidStringEnum(message = "modelCode must be one of LIDAR_DETECTION,IMAGE_DETECTION", enumClass = ModelCodeEnum.class)
    private String modelCode;

    /**
     * Model id
     */
    @NotNull(message = "not allow null")
    private Long modelId;

    /**
     * Model version
     */
    private String modelVersion;

    /**
     * Model results filtering parameters
     */
    private JSONObject resultFilterParam;

}
