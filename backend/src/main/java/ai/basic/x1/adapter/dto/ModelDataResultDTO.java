package ai.basic.x1.adapter.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelDataResultDTO {

    /**
     * 数据id
     */
    private Long dataId;

    /**
     * 模型结果
     */
    private JsonNode modelResult;
}
