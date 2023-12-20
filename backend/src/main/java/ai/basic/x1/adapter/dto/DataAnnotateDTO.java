package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.ItemTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotateDTO {

    @NotNull(message = "not allow null")
    private Long datasetId;

    @NotNull(message = "not allow null")
    private ItemTypeEnum operateItemType;

    @NotEmpty(message = "not allow null")
    private List<Long> dataIds;

    private Boolean isFilterData;

}
