package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.dto.request.ModelRunFilterDataDTO;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelRunDTO {

    @NotNull(message = "datasetId cannot be null")
    private Long datasetId;

    @NotNull(message = "modelId cannot be null")
    private Long modelId;

    private JSONObject resultFilterParam;

    @Valid
    private ModelRunFilterDataDTO dataFilterParam;

}
