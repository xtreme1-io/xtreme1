package ai.basic.x1.adapter.api.job.converter;


import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import ai.basic.x1.adapter.port.rpc.dto.LabelInfo;
import ai.basic.x1.adapter.port.rpc.dto.PreModelRespDTO;
import ai.basic.x1.entity.ObjectBO;
import ai.basic.x1.entity.PointBO;
import ai.basic.x1.entity.PreLabelModelObjectBO;
import ai.basic.x1.entity.PreModelParamBO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ModelResultConverter {

    public static PreLabelModelObjectBO preModelResultConverter(ApiResult<List<PreModelRespDTO>> preModelRespDTOApiResult,
                                                                PreModelParamBO preModelParamBO, Map<String, ModelClass> modelClassMap) {
        PreLabelModelObjectBO.PreLabelModelObjectBOBuilder<?, ?> builder = PreLabelModelObjectBO.builder();
        if (preModelRespDTOApiResult.getCode() == UsecaseCode.OK) {
            builder.dataId(preModelRespDTOApiResult.getData().get(0).getId());
            for (PreModelRespDTO preModelRespDTO : preModelRespDTOApiResult.getData()) {
                builder.message(preModelRespDTO.getMessage())
                        .code(preModelRespDTO.getCode());
                if (preModelRespDTO.getCode() == 0) {
                    builder.objects(toObjectBOs(preModelRespDTO.getClasses(), preModelParamBO, modelClassMap));
                } else {
                    builder.code(preModelRespDTO.getCode()).message(preModelRespDTO.getMessage());
                }
            }
        } else {
            builder.code(-1).message(preModelRespDTOApiResult.getMessage());
        }

        return builder.build();
    }

    public static List<ObjectBO> toObjectBOs(List<LabelInfo> labelInfos, PreModelParamBO preModelParamBO, Map<String, ModelClass> modelClassMap) {
        List<ObjectBO> list = new ArrayList<>(CollUtil.isNotEmpty(labelInfos) ? labelInfos.size() : 0);
        for (LabelInfo labelInfo : labelInfos) {
            ObjectBO objectBO = buildObjectBO(labelInfo, preModelParamBO, modelClassMap);
            if (ObjectUtil.isNotNull(objectBO)) {
                list.add(objectBO);
            }
        }
        return list;
    }

    private static ObjectBO buildObjectBO(LabelInfo labelInfo, PreModelParamBO preModelParamBO, Map<String, ModelClass> modelClassMap) {
        ObjectBO objectBO = ObjectBO.builder().confidence(labelInfo.getConfidence())
                .objType("3d")
                .modelClass(StrUtil.isNotEmpty(labelInfo.getLabel()) ?
                        ObjectUtil.isNotNull(modelClassMap.get(labelInfo.getLabel())) ? modelClassMap.get(labelInfo.getLabel()).getName() : null : null)
                .center3D(buildCenter3D(labelInfo))
                .rotation3D(buildRotation3D(labelInfo))
                .size3D(buildSize3D(labelInfo)).build();
        if (ObjectUtil.isNull(preModelParamBO)) {
            return objectBO;
        } else if (matchResult(labelInfo, preModelParamBO)) {
            return objectBO;
        }
        return null;
    }

    private static boolean matchResult(LabelInfo labelInfo, PreModelParamBO preModelParamBO) {
        boolean matchClassResult = ((CollUtil.isNotEmpty(preModelParamBO.getClasses())
                && preModelParamBO.getClasses().contains(labelInfo.getLabel().toUpperCase()))
                || CollUtil.isEmpty(preModelParamBO.getClasses()));

        boolean matchMinConfidence = ((ObjectUtil.isNotNull(preModelParamBO.getMinConfidence())
                && preModelParamBO.getMinConfidence().compareTo(labelInfo.getConfidence()) <= 0)
                || ObjectUtil.isNull(preModelParamBO.getMinConfidence()));

        boolean matchMaxConfidence = ((ObjectUtil.isNotNull(preModelParamBO.getMaxConfidence())
                && preModelParamBO.getMaxConfidence().compareTo(labelInfo.getConfidence()) >= 0)
                || ObjectUtil.isNull(preModelParamBO.getMaxConfidence()));

        return matchClassResult && matchMinConfidence && matchMaxConfidence;
    }

    private static PointBO buildCenter3D(LabelInfo labelInfo) {
        return PointBO.builder().x(labelInfo.getX()).y(labelInfo.getY()).z(labelInfo.getZ()).build();
    }

    private static PointBO buildRotation3D(LabelInfo labelInfo) {
        return PointBO.builder().x(labelInfo.getRotX()).y(labelInfo.getRotY()).z(labelInfo.getRotZ()).build();
    }

    private static PointBO buildSize3D(LabelInfo labelInfo) {
        return PointBO.builder().x(labelInfo.getDx()).y(labelInfo.getDy()).z(labelInfo.getDz()).build();
    }
}
