package ai.basic.x1.adapter.dto;

import ai.basic.x1.adapter.dto.request.ModelRunFilterDataDTO;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelRunDTO {
    @NotNull
    private Long datasetId;
    @NotNull
    private Long modelId;

    private JSONObject resultFilterParam;

    private ModelRunFilterDataDTO dataFilterParam;


}
