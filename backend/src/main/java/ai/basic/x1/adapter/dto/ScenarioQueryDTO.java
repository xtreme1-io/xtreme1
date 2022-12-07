package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioQueryDTO {

    private Long datasetId;

    private List<Long> dataIds;

    @NotEmpty(message = "classIds cannot be null")
    private List<Long> classIds;

    private String attributeId;

    private String optionName;

    @NotEmpty(message = "datasetType cannot be null")
    @ValidStringEnum(message = "type must be one of LIDAR_FUSION,LIDAR_BASIC,IMAGE", enumClass = DatasetTypeEnum.class)
    private String datasetType;
}
