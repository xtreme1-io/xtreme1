package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.entity.enums.ScenarioQuerySourceEnum;
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
public class ScenarioQueryDTO {

    private Long datasetId;

    @NotNull(message = "classId cannot be null")
    private Long classId;

    @NotEmpty(message = "source cannot be null")
    @ValidStringEnum(message = "source must be one of DATASET_CLASS,ONTOLOGY", enumClass = ScenarioQuerySourceEnum.class)
    private String source;

    private List<String> attributeIds;

    private List<String> optionNames;

    @NotEmpty(message = "datasetType cannot be null")
    @ValidStringEnum(message = "type must be one of LIDAR_FUSION,LIDAR_BASIC,IMAGE", enumClass = DatasetTypeEnum.class)
    private String datasetType;
}
