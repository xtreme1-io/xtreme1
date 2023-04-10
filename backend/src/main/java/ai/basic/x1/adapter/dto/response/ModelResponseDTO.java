package ai.basic.x1.adapter.dto.response;

import ai.basic.x1.usecase.exception.UsecaseCode;
import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelResponseDTO {

    private Integer status;

    private UsecaseCode code;

    private JSONObject content;

    private String errorMessage;
}
