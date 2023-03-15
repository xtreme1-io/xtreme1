package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author Zhujh
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ImageDetectionObjectBO extends ModelTaskInfoBO{

    private Long dataId;
    private List<ObjectBO> objects;

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ObjectBO {
        private String modelClass;
        private BigDecimal confidence;
        private String type;
        List<Point> points;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Point {
        private BigDecimal x;
        private BigDecimal y;
    }

}
