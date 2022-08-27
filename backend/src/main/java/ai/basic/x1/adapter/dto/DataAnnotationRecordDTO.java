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
public class DataAnnotationRecordDTO {

    /**
     * 数据集id
     */
    private Long datasetId;

    /**
     * 流水号
     */
    private Long serialNo;

    /**
     * 被锁定的数据
     */
    private List<DataEditDTO> datas;


}
