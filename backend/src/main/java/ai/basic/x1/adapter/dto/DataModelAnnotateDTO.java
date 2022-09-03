package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

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

    /**
     * Data id collection
     */
    @NotEmpty(message = "not allow null")
    private List<Long> dataIds;

    /**
     * Model code PRE_LABEL,TRACKING,FRONT_MIRROR_47,FRONT_MIRROR_16,COCO_80
     */
    @ValidStringEnum(message = "modelCode must be one of PRE_LABEL,TRACKING,FRONT_MIRROR_47,FRONT_MIRROR_16,COCO_80", enumClass = ModelCodeEnum.class)
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
