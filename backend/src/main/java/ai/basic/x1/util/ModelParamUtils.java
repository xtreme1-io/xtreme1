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
            case TRACKING:
                break;
            case PRE_LABEL:
            case FRONT_VIEW_16:
            case FRONT_VIEW_47:
            case COCO_80:
                var modelClass = DefaultConverter.convert(resultFilterParam, PreModelParamDTO.class);
                ValidateUtil.validate(modelClass);
                break;
            default:
                throw new UsecaseException(UsecaseCode.UNKNOWN, "Not support the model code: " + modelCode);
        }
    }
}
