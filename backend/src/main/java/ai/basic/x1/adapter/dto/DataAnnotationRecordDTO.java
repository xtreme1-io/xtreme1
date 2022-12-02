package ai.basic.x1.adapter.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
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
    @JsonSerialize(using = ToStringSerializer.class)
    private Long serialNo;

    /**
     * Locked data
     */
    private List<DataEditDTO> datas;


}
