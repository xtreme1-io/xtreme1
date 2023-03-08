package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.api.job.converter.ModelCocoRequestConverter;
import ai.basic.x1.adapter.api.job.converter.ModelCocoResponseConverter;
import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.dto.PreModelParamDTO;
import ai.basic.x1.adapter.port.dao.ModelDataResultDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDataResult;
import ai.basic.x1.adapter.port.rpc.PredImageCo80ModelHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.PreModelRespDTO;
import ai.basic.x1.adapter.port.rpc.dto.PredImageRespDTO;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.entity.ModelTaskInfoBO;
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
    private PredImageCo80ModelHttpCaller modelHttpCaller;

    @Autowired
    private ModelUseCase modelUseCase;

    @Override
    public ModelTaskInfoBO modelRun(ModelMessageBO message) {
        log.info("start model run. dataId: {}, modelSerialNo: {}", message.getDataId(),
                message.getModelSerialNo());
        var apiResult = getRetryAbleApiResult(message);
        PredImageModelObjectBO modelObject;
        if (apiResult.getCode() == UsecaseCode.OK) {
            var systemModelClassMap = modelUseCase.getModelClassMapByModelId(message.getModelId());
            var filterCondition = JSONUtil.toBean(message.getResultFilterParam(),
                    PreModelParamDTO.class);
            modelObject = ModelCocoResponseConverter.convert(apiResult.getData(), systemModelClassMap,
                    filterCondition);
        } else {
            modelObject = PredImageModelObjectBO.builder().code(-1)
                    .message(apiResult.getMessage())
                    .dataId(message.getDataId())
                    .objects(null).build();

        }
        return modelObject;
    }

    @Override
    ApiResult<PredImageRespDTO> callRemoteService(ModelMessageBO message) {
        try {
            var apiResult = modelHttpCaller
                    .callPredImageModel(ModelCocoRequestConverter.convert(message),message.getUrl());

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
        return ModelCodeEnum.IMAGE_DETECTION;
    }




}
