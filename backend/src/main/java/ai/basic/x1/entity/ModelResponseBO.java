package ai.basic.x1.entity;

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

    private JSONObject content;

    private String errorMessage;
}
