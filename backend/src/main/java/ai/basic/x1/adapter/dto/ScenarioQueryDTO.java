package ai.basic.x1.adapter.dto;

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
}
