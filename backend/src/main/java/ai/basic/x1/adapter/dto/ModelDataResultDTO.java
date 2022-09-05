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
     * Data id
     */
    private Long dataId;

    /**
     * Data model result
     */
    private JsonNode modelResult;
}
