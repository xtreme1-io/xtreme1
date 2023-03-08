package ai.basic.x1.util;

import ai.basic.x1.adapter.dto.PreModelParamDTO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;

/**
 * @author zhujh
 */
public class ModelParamUtils {

    public static void valid(JSONObject resultFilterParam, ModelCodeEnum modelCode) {
        if (JSONUtil.isNull(resultFilterParam)) {
            return;
        }
        switch (modelCode) {
            case LIDAR_DETECTION:
            case IMAGE_DETECTION:
                var modelClass = DefaultConverter.convert(resultFilterParam, PreModelParamDTO.class);
                ValidateUtil.validate(modelClass);
                break;
            default:
                throw new UsecaseException(UsecaseCode.UNKNOWN, "Not support the model code: " + modelCode);
        }
    }
}
