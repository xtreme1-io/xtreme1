package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.api.job.converter.ModelResultConverter;
import ai.basic.x1.adapter.api.job.converter.PointCloudDetectionModelReqConverter;
import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import ai.basic.x1.adapter.port.rpc.PreLabelModelHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.PreModelRespDTO;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.ModelUseCase;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author andy
 */
@Slf4j
public class PointCloudDetectionModelMessageHandler extends AbstractModelMessageHandler<List<PreModelRespDTO>> {

    @Autowired
    private PreLabelModelHttpCaller preLabelModelHttpCaller;

    @Autowired
    private ModelUseCase modelUseCase;



    @Override
    public ModelTaskInfoBO modelRun(ModelMessageBO modelMessageBO) {
        ApiResult<List<PreModelRespDTO>> apiResult = getRetryAbleApiResult(modelMessageBO);
        Map<String, ModelClass> modelClassMap = modelUseCase.getModelClassMapByModelId(modelMessageBO.getModelId());
        PreLabelModelObjectBO preLabelModelObjectBO = ModelResultConverter.preModelResultConverter(apiResult,
                JSONUtil.toBean(modelMessageBO.getResultFilterParam(), PreModelParamBO.class), modelClassMap);
        return preLabelModelObjectBO;
    }

    @Override
    ApiResult<List<PreModelRespDTO>> callRemoteService(ModelMessageBO modelMessageBO) {
        ApiResult<List<PreModelRespDTO>> listApiResult = preLabelModelHttpCaller.callPreLabelModel(PointCloudDetectionModelReqConverter.buildRequestParam(modelMessageBO),modelMessageBO.getUrl());
        return listApiResult;
    }

    @Override
    public void syncModelAnnotationResult(ModelTaskInfoBO modelTaskInfo, ModelMessageBO modelMessage) {
        var modelResult = (PreLabelModelObjectBO) modelTaskInfo;
        if (CollUtil.isNotEmpty(modelResult.getObjects())) {
            var dataAnnotationObjectBOList = new ArrayList<DataAnnotationObjectBO>(modelResult.getObjects().size());
            modelResult.getObjects().forEach(o -> {
                var dataAnnotationObjectBO = DataAnnotationObjectBO.builder()
                        .datasetId(modelMessage.getDatasetId()).dataId(modelResult.getDataId()).classAttributes(JSONUtil.parseObj(o)).build();
                dataAnnotationObjectBOList.add(dataAnnotationObjectBO);
            });

        }
    }

    @Override
    public ModelCodeEnum getModelCodeEnum() {
        return ModelCodeEnum.LIDAR_DETECTION;
    }


}
