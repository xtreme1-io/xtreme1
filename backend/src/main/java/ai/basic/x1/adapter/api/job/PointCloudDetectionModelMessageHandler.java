package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.api.job.converter.ModelResultConverter;
import ai.basic.x1.adapter.api.job.converter.PointCloudDetectionModelReqConverter;
import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.dao.mybatis.model.DataAnnotationObject;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDatasetResult;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelRunRecord;
import ai.basic.x1.adapter.port.rpc.PointCloudDetectionModelHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.PointCloudDetectionMetricsReqDTO;
import ai.basic.x1.adapter.port.rpc.dto.PointCloudDetectionObject;
import ai.basic.x1.adapter.port.rpc.dto.PointCloudDetectionRespDTO;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.DataAnnotationObjectSourceTypeEnum;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.ModelUseCase;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author andy
 */
@Slf4j
public class PointCloudDetectionModelMessageHandler extends AbstractModelMessageHandler<List<PointCloudDetectionRespDTO>> {

    @Autowired
    private PointCloudDetectionModelHttpCaller preLabelModelHttpCaller;

    @Autowired
    private ModelUseCase modelUseCase;

    @Value("${pointCloud.resultEvaluate.url}")
    private String resultEvaluateUrl;


    @Override
    public ModelTaskInfoBO modelRun(ModelMessageBO modelMessageBO) {
        ApiResult<List<PointCloudDetectionRespDTO>> apiResult = getRetryAbleApiResult(modelMessageBO);
        Map<String, ModelClass> modelClassMap = modelUseCase.getModelClassMapByModelId(modelMessageBO.getModelId());
        PointCloudDetectionObjectBO preLabelModelObjectBO = ModelResultConverter.preModelResultConverter(apiResult,
                JSONUtil.toBean(modelMessageBO.getResultFilterParam(), PointCloudDetectionParamBO.class), modelClassMap);
        return preLabelModelObjectBO;
    }

    @Override
    ApiResult<List<PointCloudDetectionRespDTO>> callRemoteService(ModelMessageBO modelMessageBO) {
        ApiResult<List<PointCloudDetectionRespDTO>> listApiResult = preLabelModelHttpCaller.callPreLabelModel(PointCloudDetectionModelReqConverter.buildRequestParam(modelMessageBO), modelMessageBO.getUrl());
        return listApiResult;
    }

    @Override
    public void syncModelAnnotationResult(ModelTaskInfoBO modelTaskInfo, ModelMessageBO modelMessage) {
        var modelResult = (PointCloudDetectionObjectBO) modelTaskInfo;
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
        var dataAnnotationObjectMap = dataAnnotationObjectList.stream().collect(Collectors.groupingBy(DataAnnotationObject::getDataId));
        modelDatasetResults.forEach(modelDatasetResult -> {
            var isSuccess = modelDatasetResult.getIsSuccess();
            if (!isSuccess) {
                return;
            }
            var modelResult = modelDatasetResult.getModelResult();
            var dataId = modelDatasetResult.getDataId();
            var dataAnnotationObjects = dataAnnotationObjectMap.get(modelDatasetResult.getDataId());
            var groundTruthObjects = new ArrayList<PointCloudDetectionObject>();
            if (CollUtil.isEmpty(dataAnnotationObjects)) {
                return;
            }
            dataAnnotationObjects.forEach(dataAnnotationObject -> {
                var pointCloudDetectionObject = new PointCloudDetectionObject();
                var objectBO = DefaultConverter.convert(dataAnnotationObject.getClassAttributes().get("contour"), ObjectBO.class);
                assembleObject(objectBO, pointCloudDetectionObject);
                groundTruthObjects.add(pointCloudDetectionObject);
            });
            var modelRunObjects = new ArrayList<PointCloudDetectionObject>();
            var pointCloudDetectionObjectBO = DefaultConverter.convert(modelResult, PointCloudDetectionObjectBO.class);
            pointCloudDetectionObjectBO.getObjects().forEach(objectBO -> {
                var pointCloudDetectionObject = new PointCloudDetectionObject();
                var confidence = objectBO.getConfidence();
                assembleObject(objectBO, pointCloudDetectionObject);
                pointCloudDetectionObject.setConfidence(confidence);
                pointCloudDetectionObject.setLabel(objectBO.getModelClass());
                modelRunObjects.add(pointCloudDetectionObject);
            });
            var groundTruthObject = PointCloudDetectionMetricsReqDTO.builder().id(dataId).objects(groundTruthObjects).build();
            var modelRunObject = PointCloudDetectionMetricsReqDTO.builder().id(dataId).objects(modelRunObjects).build();
            FileUtil.appendUtf8String(StrUtil.removeAllLineBreaks(JSONUtil.toJsonStr(groundTruthObject)), groundTruthFilePath);
            FileUtil.appendUtf8String("\n", groundTruthFilePath);
            FileUtil.appendUtf8String(StrUtil.removeAllLineBreaks(JSONUtil.toJsonStr(modelRunObject)), modelRunFilePath);
            FileUtil.appendUtf8String("\n", modelRunFilePath);
        });


    }

    private void assembleObject(ObjectBO objectBO, PointCloudDetectionObject pointCloudDetectionObject) {
        var size3D = objectBO.getSize3D();
        var center3D = objectBO.getCenter3D();
        var rotation3D = objectBO.getRotation3D();
        pointCloudDetectionObject.setX(center3D.getX());
        pointCloudDetectionObject.setY(center3D.getY());
        pointCloudDetectionObject.setZ(center3D.getY());
        pointCloudDetectionObject.setDx(size3D.getX());
        pointCloudDetectionObject.setDy(size3D.getY());
        pointCloudDetectionObject.setDz(size3D.getZ());
        pointCloudDetectionObject.setRotX(rotation3D.getX());
        pointCloudDetectionObject.setRotY(rotation3D.getY());
        pointCloudDetectionObject.setRotZ(rotation3D.getZ());
    }

    @Override
    public String getResultEvaluateUrl() {
        return resultEvaluateUrl;
    }

    @Override
    public ModelCodeEnum getModelCodeEnum() {
        return ModelCodeEnum.LIDAR_DETECTION;
    }



}
