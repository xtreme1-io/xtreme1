package ai.basic.x1.adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author fyb
 * @date 2022/3/4 13:58
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataInfoDeleteDTO {

    @NotNull(message = "datasetId cannot be null")
    private Long datasetId;

    /**
     * The collection of data ids that need to be deleted
     */
    @NotEmpty(message = "ids cannot be null")
    private List<Long> ids;
}
