package ai.basic.x1.entity;

import ai.basic.x1.entity.enums.DataFormatEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * @author fyb
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BaseQueryBO {

    private Integer pageNo;

    private Integer pageSize;

    /**
     * Data format XTREME1,COCO
     */
    private DataFormatEnum dataFormat;
}
