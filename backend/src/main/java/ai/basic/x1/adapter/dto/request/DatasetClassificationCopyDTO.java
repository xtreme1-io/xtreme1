package ai.basic.x1.adapter.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author chenchao
 * @date 2022/12/6
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetClassificationCopyDTO {

    @NotNull
    private Long datasetId;

    @NotNull
    private Long ontologyId;

    @NotEmpty
    private List<Long> classificationIds;
}
