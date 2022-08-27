package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.ModelCodeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ModelObjectBO {

    /**
     * 模型CODE
     */
    private ModelCodeEnum modelCode;

    /**
     * 模型结果列表
     */
    private List<ModelDataResultBO> modelDataResults;

}
