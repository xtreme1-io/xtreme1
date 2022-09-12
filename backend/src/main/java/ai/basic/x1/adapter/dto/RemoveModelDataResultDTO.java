package ai.basic.x1.adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RemoveModelDataResultDTO {

    /**
     * Serial number
     */
    private Long serialNo;

    /**
     * The collection of data ids that need to remove model results
     */
    private List<Long> dataIds;
}
