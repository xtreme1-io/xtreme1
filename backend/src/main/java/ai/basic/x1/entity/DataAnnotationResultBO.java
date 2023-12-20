package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataAnnotationResultBO {

    /**
     *
     */
    private Long id;

    /**
     * Data Id
     */
    private Long dataId;

    /**
     * Classification values
     */
    private List<DataAnnotationClassificationBO> classificationValues;

    /**
     * Object list
     */
    private List<DataAnnotationObjectBO> objects;

    /**
     * Create time
     */
    private OffsetDateTime createdAt;

    /**
     * Creator id
     */
    private Long createdBy;

    /**
     *  Update time
     */
    private OffsetDateTime updatedAt;

    /**
     *  Modify person id
     */
    private Long updatedBy;


}