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
public class DatasetDTO {

    private Long id;

    /**
     * 数据集名称
     */
    private String name;

    /**
     * 数据类型
     */
    private String type;

    /**
     * 描述
     */
    private String description;

    /**
     * 已经标注数量
     */
    private Integer annotatedCount;

    /**
     * 未标注数量
     */
    private Integer notAnnotatedCount;

    /**
     * 无效数据标注数量
     */
    private Integer invalidCount;

    /**
     * data count
     */
    private Integer itemCount;

    /**
     * 每一个dataset下面的数据
     */
    private List<DataInfoDTO> datas;
}
