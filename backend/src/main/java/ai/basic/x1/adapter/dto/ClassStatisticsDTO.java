package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.ClassStatisticsUnitBO;
import ai.basic.x1.entity.DatasetStatisticsBO;
import ai.basic.x1.entity.ToolTypeStatisticsUnitBO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author zhujh
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassStatisticsDTO {

    private List<ToolTypeStatisticsUnitDTO> toolTypeUnits;

    private List<ClassStatisticsUnitDTO> classUnits;

}
