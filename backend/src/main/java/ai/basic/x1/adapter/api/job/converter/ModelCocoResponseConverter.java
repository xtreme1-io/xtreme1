package ai.basic.x1.adapter.api.job.converter;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.dto.PreModelParamDTO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import ai.basic.x1.adapter.port.rpc.dto.PreModelRespDTO;
import ai.basic.x1.adapter.port.rpc.dto.PredImageRespDTO;
import ai.basic.x1.entity.PreLabelModelObjectBO;
import ai.basic.x1.entity.PredImageModelObjectBO;
import ai.basic.x1.usecase.exception.UsecaseCode;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author zhujh
 */
@Slf4j
public class ModelCocoResponseConverter {

    public static PredImageModelObjectBO convert(ApiResult<PredImageRespDTO> predImageRespDTOApiResult,
                                                 Map<String, ModelClass> systemModelClassMap,
                                                 PreModelParamDTO filterCondition) {
        PredImageModelObjectBO.PredImageModelObjectBOBuilder<?, ?> builder = PredImageModelObjectBO.builder();
        var response = predImageRespDTOApiResult.getData();
        if (predImageRespDTOApiResult.getCode() == UsecaseCode.OK) {
            if (CollUtil.isEmpty(response.getObjects())) {
                builder.code(UsecaseCode.OK.getCode())
                        .message("success")
                        .dataId(response.getId())
                        .objects(List.of());
            } else {
                log.info("start filter predItem. filter condition: " + JSONUtil.toJsonStr(filterCondition));
                var predObjects = response.getObjects()
                        .stream()
                        .filter(item -> matchSelectedClassAndConfidence(item, filterCondition)
                        )
                        .map(item -> buildObject(item, systemModelClassMap))
                        .collect(Collectors.toList());
                builder.confidence(response.getConfidence());
                if (CollUtil.isNotEmpty(predObjects) && ObjectUtil.isNull(response.getConfidence())) {
                    var dataConfidence = predObjects.stream().mapToDouble(object -> object.getConfidence().doubleValue()).summaryStatistics();
                    builder.confidence(BigDecimal.valueOf(dataConfidence.getAverage()));
                }
                builder.code(UsecaseCode.OK.getCode())
                        .message("success")
                        .dataId(response.getId())
                        .objects(predObjects);
            }
        } else {
            builder.code(UsecaseCode.ERROR.getCode())
                    .message(predImageRespDTOApiResult.getMessage())
                    .objects(null).build();
        }
        return builder.build();
    }

    private static PredImageModelObjectBO.ObjectBO buildObject(PredImageRespDTO.PredictItem predictItem, Map<String, ModelClass> modelClassMap) {
        var topLeft = PredImageModelObjectBO.Point
                .builder()
                .x(predictItem.getLeftTopX())
                .y(predictItem.getLeftTopY()).build();
        var bottomRight = PredImageModelObjectBO.Point
                .builder()
                .x(predictItem.getRightBottomX())
                .y(predictItem.getRightBottomY()).build();

        return PredImageModelObjectBO
                .ObjectBO.builder()
                .confidence(predictItem.getConfidence())
                .modelClass(StrUtil.isNotEmpty(predictItem.getLabel()) ?
                        ObjectUtil.isNotNull(modelClassMap.get(predictItem.getLabel())) ? modelClassMap.get(predictItem.getLabel()).getName() : null : null)
                .objType("rectangle")
                .points(List.of(topLeft, bottomRight))
                .build();
    }

    private static boolean matchSelectedClassAndConfidence(PredImageRespDTO.PredictItem predictItem,
                                                           PreModelParamDTO filterPredItem) {
        if (filterPredItem == null || CollUtil.isEmpty(filterPredItem.getClasses())) {
            throw new IllegalArgumentException("model param is empty");
        }
        if (CollUtil.isEmpty(filterPredItem.getClasses())) {
            throw new IllegalArgumentException("model class select at least one class");
        }
        var maxConfidence = getMaxConfidence(filterPredItem.getMaxConfidence());
        var minConfidence = getMinConfidence(filterPredItem.getMinConfidence());
        var selectedClasses = new HashSet<>(filterPredItem.getClasses());
        var selectedUpperClasses = selectedClasses.stream().map(c -> c.toUpperCase()).collect(Collectors.toList());

        String label = predictItem.getLabel();
        return selectedUpperClasses.contains(label.toUpperCase()) &&
                betweenConfidence(predictItem.getConfidence(), minConfidence, maxConfidence);
    }

    private static boolean betweenConfidence(BigDecimal predConfidence, BigDecimal minConfidence,
                                             BigDecimal maxConfidence) {
        return minConfidence.compareTo(predConfidence) <= 0 && maxConfidence.compareTo(predConfidence) >= 0;
    }

    private static BigDecimal getMaxConfidence(BigDecimal confidence) {
        return confidence == null ? new BigDecimal(1) : confidence;
    }

    private static BigDecimal getMinConfidence(BigDecimal confidence) {
        return confidence == null ? new BigDecimal(0) : confidence;
    }

}
