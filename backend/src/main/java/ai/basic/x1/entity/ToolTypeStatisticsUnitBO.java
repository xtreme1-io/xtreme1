package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ToolTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolTypeStatisticsUnitBO {

    private Integer objectAmount;

    private ToolTypeEnum toolType;

}
