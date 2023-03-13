package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author andy
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PreLabelModelObjectBO extends ModelTaskInfoBO{

    private Long dataId;
    private List<ObjectBO> objects;

}
