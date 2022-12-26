package ai.basic.x1.adapter.port.dao.mybatis.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioQuery {

    private Long datasetId;

    private List<Long> dataIds;

    private List<Long> classIds;

    private List<String> attributeIds;

    private List<String> optionNames;
}
