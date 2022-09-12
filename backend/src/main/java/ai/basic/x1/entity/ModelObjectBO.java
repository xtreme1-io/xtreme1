package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ModelCodeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

/**
 * @author fyb
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ModelObjectBO {

    /**
     * Model code PRE_LABEL,COCO_80
     */
    private ModelCodeEnum modelCode;

    /**
     * Data model results
     */
    private List<ModelDataResultBO> modelDataResults;

}
