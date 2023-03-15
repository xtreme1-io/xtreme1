package ai.basic.x1.adapter.port.rpc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelResultEvaluateRespDTO {

    private List<ModelMetricBO> metrics;

    /**
     * Model run metrics
     */
    @Data
    public class ModelMetricBO {

        private String name;

        private String value;

        private String description;

    }
}
