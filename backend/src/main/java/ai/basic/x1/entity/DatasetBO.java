package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DatasetTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * @author fyb
 * @date 2022/2/16 14:10
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetBO {

    /**
     * Dataset id
     */
    private Long id;

    /**
     * Dataset name
     */
    private String name;

    /**
     * Dataset type
     */
    private DatasetTypeEnum type;

    /**
     * Dataset description
     */
    private String description;

    /**
     * Is deleted
     */
    private Boolean isDeleted;

    /**
     * Create time
     */
    private OffsetDateTime createdAt;

    /**
     * Creator id
     */
    private Long createdBy;

    /**
     * Update time
     */
    private OffsetDateTime updatedAt;

    /**
     * Modify person id
     */
    private Long updatedBy;

    /**
     * The first 6 pieces of data information
     */
    private List<DataInfoBO> datas;

    /**
     * Annotated data count
     */
    private Integer notAnnotatedDataCount;

    /**
     * Not annotate data count
     */
    private Integer annotatedDataCount;

    /**
     * Invalid data count
     */
    private Integer invalidDataCount;

}
