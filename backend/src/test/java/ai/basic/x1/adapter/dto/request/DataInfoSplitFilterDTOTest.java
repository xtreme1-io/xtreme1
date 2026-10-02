package ai.basic.x1.adapter.dto.request;

import javax.validation.Validation;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class DataInfoSplitFilterDTOTest {

    @Test
    void acceptsAnEmptyPartition() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            for (int[] ratios : new int[][] {{100, 0, 0}, {0, 100, 0}, {0, 0, 100}}) {
                var dto = DataInfoSplitFilterDTO.builder()
                        .datasetId(1L)
                        .totalSizeRatio(100)
                        .trainingRatio(ratios[0])
                        .validationRatio(ratios[1])
                        .testRatio(ratios[2])
                        .splittingBy("RANDOM")
                        .build();

                var violations = factory.getValidator().validate(dto);
                assertTrue(violations.isEmpty(), violations.toString());
            }
        }
    }
}
