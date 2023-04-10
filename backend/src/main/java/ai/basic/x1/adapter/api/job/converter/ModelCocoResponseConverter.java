package ai.basic.x1.adapter.api.job.converter;

import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.dto.PreModelParamDTO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import ai.basic.x1.adapter.port.rpc.dto.ImageDetectionObject;
import ai.basic.x1.adapter.port.rpc.dto.ImageDetectionRespDTO;
import ai.basic.x1.entity.ImageDetectionObjectBO;
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

    public static ImageDetectionObjectBO convert(ApiResult<ImageDetectionRespDTO> predImageRespDTOApiResult,
                                                 Map<String, ModelClass> systemModelClassMap,
                                                 PreModelParamDTO filterCondition) {
        ImageDetectionObjectBO.ImageDetectionObjectBOBuilder<?, ?> builder = ImageDetectionObjectBO.builder();
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

    private static ImageDetectionObjectBO.ObjectBO buildObject(ImageDetectionObject imageDetectionObject, Map<String, ModelClass> modelClassMap) {
        var topLeft = ImageDetectionObjectBO.Point
                .builder()
                .x(imageDetectionObject.getLeftTopX())
                .y(imageDetectionObject.getLeftTopY()).build();
        var bottomRight = ImageDetectionObjectBO.Point
                .builder()
                .x(imageDetectionObject.getRightBottomX())
                .y(imageDetectionObject.getRightBottomY()).build();

        return ImageDetectionObjectBO
                .ObjectBO.builder()
                .confidence(imageDetectionObject.getConfidence())
                .modelClass(StrUtil.isNotEmpty(imageDetectionObject.getLabel()) ?
                        ObjectUtil.isNotNull(modelClassMap.get(imageDetectionObject.getLabel())) ? modelClassMap.get(imageDetectionObject.getLabel()).getName() : null : null)
                .type("RECTANGLE")
                .points(List.of(topLeft, bottomRight))
                .build();
    }

    private static boolean matchSelectedClassAndConfidence(ImageDetectionObject imageDetectionObject,
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

        String label = imageDetectionObject.getLabel();
        return selectedUpperClasses.contains(label.toUpperCase()) &&
                betweenConfidence(imageDetectionObject.getConfidence(), minConfidence, maxConfidence);
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
