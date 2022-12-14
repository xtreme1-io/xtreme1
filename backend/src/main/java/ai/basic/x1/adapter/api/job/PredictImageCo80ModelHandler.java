package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.api.job.converter.ModelCocoRequestConverter;
import ai.basic.x1.adapter.api.job.converter.ModelCocoResponseConverter;
import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.dto.PreModelParamDTO;
import ai.basic.x1.adapter.port.dao.ModelDataResultDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDataResult;
import ai.basic.x1.adapter.port.rpc.PredImageCo80ModelHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.PredImageRespDTO;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.entity.PredImageModelObjectBO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.ModelUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.OffsetDateTime;

/**
 * @author Zhujh
 */
@Slf4j
public class PredictImageCo80ModelHandler extends AbstractModelMessageHandler<PredImageRespDTO> {

    @Autowired
    private ModelDataResultDAO modelDataResultDAO;

    @Autowired
    private PredImageCo80ModelHttpCaller modelHttpCaller;

    @Autowired
    private ModelUseCase modelUseCase;

    private ModelRunSuccessHandler<PredImageRespDTO> successHandler = new DefaultModelRunSuccessHandler();
    private ModelRunFailureHandler failureHandler = (message, ex) -> {
       var modelObject = PredImageModelObjectBO.builder().code(-1)
                .message(ex.getMessage())
                .dataId(message.getDataId())
                .objects(null).build();
        this.updateModelDataResult(modelObject, message);
    };

    @Override
    public boolean modelRun(ModelMessageBO message) {
        log.info("start model run. dataId: {}, modelSerialNo: {}",  message.getDataId(),
                message.getModelSerialNo());
        var apiResult = getRetryAbleApiResult(message);
        if (apiResult.getCode() == UsecaseCode.OK) {
            try {
                successHandler.onModelRunSuccess(apiResult.getData(), message);
            } catch (Exception e) {
                failureHandler.onModelRunFailure(message, e);
            }
        } else {
            failureHandler.onModelRunFailure(message, new UsecaseException(apiResult.getMessage()));
        }
        return true;
    }

    @Override
    ApiResult<PredImageRespDTO> callRemoteService(ModelMessageBO message) {
        try {
            var apiResult = modelHttpCaller
                    .callPredImageModel(ModelCocoRequestConverter.convert(message));

            if (CollUtil.isNotEmpty(apiResult.getData())) {
                return new ApiResult<>(apiResult.getCode(), apiResult.getMessage(),
                        apiResult.getData().get(0));
            }
            return new ApiResult<>(apiResult.getCode(), apiResult.getMessage());
        } catch (Exception e) {
            throw new UsecaseException(UsecaseCode.UNKNOWN, e.getMessage());
        }
    }

    @Override
    public ModelCodeEnum getModelCodeEnum() {
        return ModelCodeEnum.COCO_80;
    }

    private void updateModelDataResult(PredImageModelObjectBO modelObject, ModelMessageBO message) {
        try {
            modelDataResultDAO.update(ModelDataResult.builder()
                            .updatedAt(OffsetDateTime.now())
                            .updatedBy(message.getCreatedBy())
                            .modelResult(objectMapper.readValue(JSONUtil.toJsonStr(modelObject), JsonNode.class))
                            .build(),
                    Wrappers.lambdaUpdate(ModelDataResult.class)
                            .eq(ModelDataResult::getModelSerialNo, message.getModelSerialNo())
                            .eq(ModelDataResult::getDataId, message.getDataId()));
        } catch (JsonProcessingException e) {
            log.error("UpdateModelDataResult convert jsonNode error. ", e);
        }
    }

    private class DefaultModelRunSuccessHandler implements ModelRunSuccessHandler<PredImageRespDTO> {

        @Override
        public void onModelRunSuccess(PredImageRespDTO responseData, ModelMessageBO message) {
            var systemModelClassMap = modelUseCase.getModelClassMapByModelId(message.getModelId());
            var filterCondition = JSONUtil.toBean(message.getResultFilterParam(),
                    PreModelParamDTO.class);
            var modelObject = ModelCocoResponseConverter.convert(responseData, systemModelClassMap,
                    filterCondition);

            PredictImageCo80ModelHandler.this.updateModelDataResult(modelObject, message);
        }
    }

}
