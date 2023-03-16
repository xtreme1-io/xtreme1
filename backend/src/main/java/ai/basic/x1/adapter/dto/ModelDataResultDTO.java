package ai.basic.x1.adapter.dto;

import cn.hutool.json.JSONObject;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author fyb
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelDataResultDTO {

    /**
     * Data id
     */
    private Long dataId;

    /**
     * Data model result
     */
    private JSONObject modelResult;
}
