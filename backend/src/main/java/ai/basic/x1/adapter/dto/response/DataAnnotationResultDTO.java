package ai.basic.x1.adapter.dto.response;

import ai.basic.x1.adapter.dto.DataAnnotationClassificationDTO;
import ai.basic.x1.adapter.dto.DataAnnotationObjectDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author fyb
 * @date 2022-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationResultDTO {

    /**
     * Data id
     */
    private Long dataId;

    /**
     * Classification values
     */
    private List<DataAnnotationClassificationDTO> classificationValues;

    /**
     * Object list
     */
    private List<DataAnnotationObjectDTO> objects;


}