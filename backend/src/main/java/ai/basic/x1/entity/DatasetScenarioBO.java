package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.entity.enums.ScenarioQuerySourceEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetScenarioBO {

    private ScenarioQuerySourceEnum source;

    private Long ontologyClassId;

    private List<Long> classIds;

    private String attributeId;

    private String optionName;

    private DatasetTypeEnum datasetType;

    private String datasetName;

}
