package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageDetectionObject {

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
