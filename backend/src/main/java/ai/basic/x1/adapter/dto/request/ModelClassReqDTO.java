package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.adapter.dto.ModelClassDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelClassReqDTO {

    /**
     * Model id
     */
    @NotNull(message = "Model id cannot be null")
    private Long modelId;

    private List<ModelClassDTO> modelClassList;
}
