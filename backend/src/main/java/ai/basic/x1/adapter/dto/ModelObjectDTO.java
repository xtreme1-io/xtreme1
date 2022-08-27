package ai.basic.x1.adapter.dto;

import ai.basic.x1.entity.enums.ModelCodeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelObjectDTO {

    /**
     * 模型CODE
     */
    private ModelCodeEnum modelCode;

    /**
     * 模型结果列表
     */
    private List<ModelDataResultDTO> modelDataResults;
}
