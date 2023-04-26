package ai.basic.x1.adapter.dto.request;


import ai.basic.x1.adapter.api.annotation.valid.ValidStringEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.groups.Default;

/**
 * @author fyb
 * @date 2022/2/18 14:41
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetRequestDTO {

    @NotEmpty(message = "id cannot be null", groups = GroupUpdate.class)
    private Long id;

    /**
     * Dataset name
     */
    @NotEmpty(message = "name cannot be null")
    private String name;

    /**
     * Dataset type LIDAR_FUSION, LIDAR_BASIC, IMAGE
     */
    @NotEmpty(message = "dataset type cannot be null", groups = GroupInsert.class)
    @ValidStringEnum(message = "dataset type must be one of LIDAR_FUSION, LIDAR_BASIC, IMAGE,TEXT", enumClass = DatasetTypeEnum.class)
    private String type;

    /**
     * Dataset description
     */
    private String description;

    public interface GroupInsert extends Default {
    }

    public interface GroupUpdate extends Default {
    }

}
