package ai.basic.x1.entity;

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
public class ModelResponseBO {

    private Integer status;

    private UsecaseCode code;

    private JSONObject content;

    private String errorMessage;
}
