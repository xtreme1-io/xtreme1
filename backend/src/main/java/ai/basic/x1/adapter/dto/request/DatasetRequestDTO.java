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
     * 数据集名称
     */
    @NotEmpty(message = "name cannot be null")
    private String name;

    /**
     * 数据类型
     */
    @NotEmpty(message = "dataset type cannot be null", groups = GroupInsert.class)
    @ValidStringEnum(message = "dataset type must be one of LIDAR_FUSION, LIDAR_BASIC, IMAGE", enumClass = DatasetTypeEnum.class)
    private String type;

    /**
     * 描述
     */
    private String description;

    /**
     * 定义专属的业务逻辑分组
     */
    public interface GroupInsert extends Default {
    }

    public interface GroupUpdate extends Default {
    }

}
