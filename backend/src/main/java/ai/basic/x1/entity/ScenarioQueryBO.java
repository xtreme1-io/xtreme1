package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
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
