package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.ModelCodeEnum;
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
public class ModelObjectDTO {

    /**
     * Model code
     */
    private ModelCodeEnum modelCode;

    /**
     * Data model results
     */
    private List<ModelDataResultDTO> modelDataResults;
}
