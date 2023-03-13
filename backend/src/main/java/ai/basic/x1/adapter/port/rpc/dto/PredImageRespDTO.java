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

    private Long id;
    private String code;
    private String message;
    private List<PredictItem> objects;
    /**
     * Confidence level
     */
    private BigDecimal confidence;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PredictItem {

        /**
         * Target class
         */
        private String label;

        /**
         * Confidence level
         */
        private BigDecimal confidence;

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
