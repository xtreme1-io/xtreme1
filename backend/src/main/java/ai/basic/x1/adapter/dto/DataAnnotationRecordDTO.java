package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.ItemTypeEnum;
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

    private ItemTypeEnum itemType;

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
