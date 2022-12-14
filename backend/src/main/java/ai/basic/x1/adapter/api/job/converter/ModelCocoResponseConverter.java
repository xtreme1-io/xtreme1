package ai.basic.x1.adapter.api.job.converter;

import ai.basic.x1.adapter.dto.PreModelParamDTO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import ai.basic.x1.adapter.port.rpc.dto.PredImageRespDTO;
import ai.basic.x1.entity.PredImageModelObjectBO;
import cn.hutool.core.collection.CollUtil;
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

    public static PredImageModelObjectBO convert(PredImageRespDTO response,
                                               Map<String, ModelClass> systemModelClassMap,
                                              PreModelParamDTO filterCondition) {
        if (CollUtil.isEmpty(response.getPredictItems())) {
            return PredImageModelObjectBO.builder().code(1)
                    .message("success")
                    .dataId(response.getImageId())
                    .objects(List.of()).build();
        } else {
            log.info("start filter predItem. filter condition: " + JSONUtil.toJsonStr(filterCondition));
            var predObjects = response.getPredictItems()
                    .stream()
                    .filter(item -> matchSystemModelClass(item.getClsid(), systemModelClassMap)
                            && matchSelectedClassAndConfidence(item, filterCondition)
                    )
                    .map(item -> buildObject(item, systemModelClassMap.get(String.valueOf(item.getClsid()))))
                    .collect(Collectors.toList());

            return PredImageModelObjectBO.builder().code(0)
                    .message("success")
                    .dataId(response.getImageId())
                    .objects(predObjects).build();
        }
    }

    private static PredImageModelObjectBO.ObjectBO buildObject(PredImageRespDTO.PredictItem predictItem,
                                                        ModelClass modelClass) {
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
                .confidence(predictItem.getScore())
                .modelClass(modelClass.getName())
                .modelClassId(Integer.valueOf(modelClass.getCode()))
                .objType("rectangle")
                .points(List.of(topLeft, bottomRight))
                .build();
    }

    private static boolean matchSystemModelClass(Integer clsid, Map<String, ModelClass> systemModelClassMap) {
        return systemModelClassMap.containsKey(String.valueOf(clsid));
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

        String clsId = String.valueOf(predictItem.getClsid());
        return selectedClasses.contains(clsId) &&
                betweenConfidence(predictItem.getScore(), minConfidence, maxConfidence);
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
