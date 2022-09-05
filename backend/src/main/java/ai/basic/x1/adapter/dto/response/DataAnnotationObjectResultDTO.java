package ai.basic.x1.adapter.dto.response;

import ai.basic.x1.adapter.dto.DataAnnotationObjectDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author chenchao
 * @date 2022/9/2
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationObjectResultDTO {

    private OffsetDateTime queryDate;

    private List<DataAnnotationObjectDTO> dataAnnotationObjects;
}
