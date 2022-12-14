package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioQueryBO extends BaseQueryBO{

    private Long datasetId;

    private List<Long> dataIds;

    private List<Long> classIds;

    private List<String> attributeIds;

    private List<String> optionNames;

    private DatasetTypeEnum datasetType;
}
