package ai.basic.x1.adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RemoveModelDataResultDTO {

    /**
     * 模型流水号
     */
    private Long serialNo;

    /**
     * 数据集合
     */
    private List<Long> dataIds;
}
