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

    @NotNull(message = "not allow null")
    private Long datasetId;

    @NotEmpty(message = "not allow null")
    private List<Long> dataIds;

    @ValidStringEnum(message = "modelCode must be one of PRE_LABEL,TRACKING,FRONT_MIRROR_47,FRONT_MIRROR_16,COCO_80", enumClass = ModelCodeEnum.class)
    private String modelCode;

    @NotNull(message = "not allow null")
    private Long modelId;

    private String modelVersion;

    private JSONObject resultFilterParam;

}
