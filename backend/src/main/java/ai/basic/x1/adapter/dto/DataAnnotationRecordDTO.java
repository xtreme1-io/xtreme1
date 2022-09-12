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
public class DataAnnotationRecordDTO {

    /**
     * Dataset id
     */
    private Long datasetId;

    /**
     * Serial number
     */
    private Long serialNo;

    /**
     * Locked data
     */
    private List<DataEditDTO> datas;


}
