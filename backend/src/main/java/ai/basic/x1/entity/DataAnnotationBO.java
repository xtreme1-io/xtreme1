package ai.basic.x1.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

/**
 * @author fyb
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationBO {

    private Long id;

    private Long datasetId;

    private Long dataId;

    private Long classificationId;

    private JsonNode classificationAttributes;

    private OffsetDateTime createdAt;

    private Long createdBy;

}
