package ai.basic.x1.adapter.port.rpc.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author Zhujh
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredImageRespDTO {

    @JsonAlias(value = "image_id")
    private Long imageId;

    @JsonAlias(value = "det_res")
    private List<PredictItem> predictItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PredictItem {

        /**
         * Target category id
         */
        private Integer clsid;

        /**
         * Target class
         */
        @JsonAlias(value = "class")
        private String className;

        /**
         * Target parent class
         */
        @JsonAlias(value = "super_class")
        private String superClass;

        /**
         * Confidence level
         */
        private BigDecimal score;

        /**
         * The upper left abscissa of the detection box
         */
        private BigDecimal leftTopX;

        /**
         * The upper left ordinate of the detection box
         */
        private BigDecimal leftTopY;

        /**
         * The lower right abscissa of the detection box
         */
        private BigDecimal rightBottomX;

        /**
         * The bottom right ordinate of the detection box
         */
        private BigDecimal rightBottomY;

    }

}
