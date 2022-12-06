package ai.basic.x1.adapter.port.dao.mybatis.model;

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
public class ToolTypeStatisticsUnit {

    private ToolTypeEnum toolType;

    private Integer objectAmount;

}
