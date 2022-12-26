package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ToolTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author zhujh
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassStatisticsUnitBO {

    private ToolTypeEnum toolType;

    private String name;

    private String color;

    private Integer objectAmount;
}
