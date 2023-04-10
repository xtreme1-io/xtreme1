package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

/**
 * @author andy
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PointCloudDetectionObjectBO extends ModelTaskInfoBO{

    private Long dataId;
    private List<ObjectBO> objects;

}
