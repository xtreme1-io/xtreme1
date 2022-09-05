package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DatasetSortFieldEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.entity.enums.SortEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 * @date 2022/4/8 16:17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetQueryDTO {

    /**
     * Dataset name
     */
    private String name;

    /**
     * Dataset create start time
     */
    private String createStartTime;

    /**
     * Dataset create end time
     */
    private String createEndTime;

    /**
     * Sort field
     */
    @ValidStringEnum(message = "sort field must be one of NAME,CREATED_AT,UPDATED_AT", enumClass = DatasetSortFieldEnum.class)
    private String sortField;

    /**
     * Ascending or descending order
     */
    @ValidStringEnum(message = "ascOrDesc must be one of ASC,DESC", enumClass = SortEnum.class)
    private String ascOrDesc;

    /**
     * Dataset type
     */
    @ValidStringEnum(message = "type must be one of LIDAR_FUSION,LIDAR_BASIC,IMAGE", enumClass = DatasetTypeEnum.class)
    private String type;

}
