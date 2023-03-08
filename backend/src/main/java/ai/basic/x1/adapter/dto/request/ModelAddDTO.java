package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DataUploadSourceEnum;
import ai.basic.x1.entity.enums.ModelDatasetTypeEnum;
import ai.basic.x1.entity.enums.ModelTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

/**
 * @author fyb
 * @date 2023/3/2
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelAddDTO {

    @NotEmpty(message = "id cannot be null")
    private String name;

    /**
     * Supported dataset types
     */
    @ValidStringEnum(message = "datasetType must be one of LIDAR, IMAGE", enumClass = ModelDatasetTypeEnum.class)
    @NotEmpty(message = "datasetType cannot be null")
    private String datasetType;

    /**
     * Model type
     */
    @ValidStringEnum(message = "modelType must be one of DETECTION", enumClass = ModelTypeEnum.class)
    @NotEmpty(message = "modelType cannot be null")
    private String modelType;

    private String description;
}
