package ai.basic.x1.adapter.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationDTO {


    private Long id;

    private Long datasetId;

    private Long dataId;

    private Long classificationId;

    private JsonNode classificationAttributes;
}
