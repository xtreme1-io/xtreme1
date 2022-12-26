package ai.basic.x1.entity;

import lombok.Data;

import java.util.List;

/**
 * @author fyb
 */
@Data
public class DataImportResultBO {

    /**
     * Annotation results
     */
    private List<DataAnnotationResultObjectBO> objects;
}
