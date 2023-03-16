package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.api.job.converter.ModelCocoRequestConverter;
import ai.basic.x1.adapter.api.job.converter.ModelCocoResponseConverter;
import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.dto.PreModelParamDTO;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDatasetResult;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelRunRecord;
import ai.basic.x1.adapter.port.rpc.ImageDetectionModelHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.ImageDetectionMetricsReqDTO;
import ai.basic.x1.adapter.port.rpc.dto.ImageDetectionObject;
import ai.basic.x1.adapter.port.rpc.dto.ImageDetectionRespDTO;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.DataAnnotationObjectSourceTypeEnum;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.ModelUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Zhujh
 */
@Slf4j
public class ImageDetectionModelHandler extends AbstractModelMessageHandler<ImageDetectionRespDTO> {

    @Autowired
    private ImageDetectionModelHttpCaller modelHttpCaller;

    @Autowired
    private ModelUseCase modelUseCase;

    @Value("${image.resultEvaluate.url}")
    private String resultEvaluateUrl;

    @Override
    public ModelTaskInfoBO modelRun(ModelMessageBO message) {
        log.info("start model run. dataId: {}, modelSerialNo: {}", message.getDataId(),
                message.getModelSerialNo());
        var apiResult = getRetryAbleApiResult(message);
        var systemModelClassMap = modelUseCase.getModelClassMapByModelId(message.getModelId());
        var filterCondition = JSONUtil.toBean(message.getResultFilterParam(),
                PreModelParamDTO.class);
        return ModelCocoResponseConverter.convert(apiResult, systemModelClassMap, filterCondition);
    }

    @Override
    ApiResult<ImageDetectionRespDTO> callRemoteService(ModelMessageBO message) {
        try {
            var apiResult = modelHttpCaller
                    .callPredImageModel(ModelCocoRequestConverter.convert(message), message.getUrl());

            if (CollUtil.isNotEmpty(apiResult.getData())) {
                return new ApiResult<>(apiResult.getCode(), apiResult.getMessage(),
                        apiResult.getData().get(0));
            }
            return new ApiResult<>(apiResult.getCode(), apiResult.getMessage());
        } catch (Exception e) {
            log.error("call image error",e);
            throw new UsecaseException(UsecaseCode.UNKNOWN, e.getMessage());
        }
    }

    @Override
    public void syncModelAnnotationResult(ModelTaskInfoBO modelTaskInfo, ModelMessageBO modelMessage) {
        var modelResult = (ImageDetectionObjectBO) modelTaskInfo;
        if (CollUtil.isNotEmpty(modelResult.getObjects())) {
            var lambdaQueryWrapper = Wrappers.lambdaQuery(ModelRunRecord.class);
            lambdaQueryWrapper.eq(ModelRunRecord::getModelSerialNo,modelMessage.getModelSerialNo());
            lambdaQueryWrapper.last("limit 1");
            var modelRunRecord = modelRunRecordDAO.getOne(lambdaQueryWrapper);
            var dataAnnotationObjectBOList = new ArrayList<DataAnnotationObjectBO>(modelResult.getObjects().size());
            modelResult.getObjects().forEach(o -> {
                var dataAnnotationObjectBO = DataAnnotationObjectBO.builder()
                        .datasetId(modelMessage.getDatasetId()).dataId(modelResult.getDataId()).classAttributes(JSONUtil.parseObj(o))
                        .sourceType(DataAnnotationObjectSourceTypeEnum.MODEL).sourceId(modelRunRecord.getId()).build();
                dataAnnotationObjectBOList.add(dataAnnotationObjectBO);
            });

            dataAnnotationObjectDAO.saveBatch(DefaultConverter.convert(dataAnnotationObjectBOList, DataAnnotationObject.class));
        }
    }

    @Override
    public void assembleCalculateMetricsData(List<ModelDatasetResult> modelDatasetResults, List<DataAnnotationObject> dataAnnotationObjectList,
                                             String groundTruthFilePath, String modelRunFilePath) {
        if (CollUtil.isEmpty(modelDatasetResults)) {
            return;
        }
        var dataAnnotationObjectMap = dataAnnotationObjectList.stream().filter(dataAnnotationObject -> {
            var objectBO = DefaultConverter.convert(dataAnnotationObject.getClassAttributes(), ImageDetectionObjectBO.ObjectBO.class);
            return "RECTANGLE".equalsIgnoreCase(objectBO.getType());
        }).collect(Collectors.groupingBy(DataAnnotationObject::getDataId));
        modelDatasetResults.forEach(modelDatasetResult -> {
            var isSuccess = modelDatasetResult.getIsSuccess();
            if (!isSuccess) {
                return;
            }
            var modelResult = modelDatasetResult.getModelResult();
            var dataId = modelDatasetResult.getDataId();
            var dataAnnotationObjects = dataAnnotationObjectMap.get(modelDatasetResult.getDataId());
            var groundTruthObjects = new ArrayList<ImageDetectionObject>();
            if (CollUtil.isEmpty(dataAnnotationObjects)) {
                return;
            }
            dataAnnotationObjects.forEach(dataAnnotationObject -> {
                var imageDetectionObject = new ImageDetectionObject();
                var objectBO = DefaultConverter.convert(dataAnnotationObject.getClassAttributes().get("contour"), ImageDetectionObjectBO.ObjectBO.class);
                assembleObject(objectBO, imageDetectionObject);
                groundTruthObjects.add(imageDetectionObject);
            });
            var modelRunObjects = new ArrayList<ImageDetectionObject>();
            var predImageModelObjectBO = DefaultConverter.convert(modelResult, ImageDetectionObjectBO.class);
            predImageModelObjectBO.getObjects().forEach(objectBO -> {
                var imageDetectionObject = new ImageDetectionObject();
                var confidence = objectBO.getConfidence();
                assembleObject(objectBO, imageDetectionObject);
                imageDetectionObject.setConfidence(confidence);
                modelRunObjects.add(imageDetectionObject);
            });
            var groundTruthObject = ImageDetectionMetricsReqDTO.builder().id(dataId).objects(groundTruthObjects).build();
            var modelRunObject = ImageDetectionMetricsReqDTO.builder().id(dataId).objects(modelRunObjects).build();
            FileUtil.appendUtf8String(StrUtil.removeAllLineBreaks(JSONUtil.toJsonStr(groundTruthObject)), groundTruthFilePath);
            FileUtil.appendUtf8String("\n", groundTruthFilePath);
            FileUtil.appendUtf8String(StrUtil.removeAllLineBreaks(JSONUtil.toJsonStr(modelRunObject)), modelRunFilePath);
            FileUtil.appendUtf8String("\n", modelRunFilePath);
        });
    }

    private void assembleObject(ImageDetectionObjectBO.ObjectBO objectBO, ImageDetectionObject imageDetectionObject) {
        var points = objectBO.getPoints();
        if (CollUtil.isEmpty(points)) {
            return;
        }
        var leftTopX = points.get(0).getX();
        var leftTopY = points.get(0).getY();
        var rightBottomX = points.get(1).getX();
        var rightBottomY = points.get(1).getY();
        imageDetectionObject.setLeftTopX(leftTopX);
        imageDetectionObject.setLeftTopY(leftTopY);
        imageDetectionObject.setRightBottomX(rightBottomX);
        imageDetectionObject.setRightBottomY(rightBottomY);
    }

    @Override
    public String getResultEvaluateUrl() {
        return resultEvaluateUrl;
    }


    @Override
    public ModelCodeEnum getModelCodeEnum() {
        return ModelCodeEnum.IMAGE_DETECTION;
    }


}
