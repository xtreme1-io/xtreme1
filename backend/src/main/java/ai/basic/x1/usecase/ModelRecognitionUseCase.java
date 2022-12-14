package ai.basic.x1.usecase;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.api.job.AbstractModelMessageHandler;
import ai.basic.x1.adapter.dto.ModelObjectDTO;
import ai.basic.x1.adapter.dto.request.ModelRecognitionRequestDTO;
import ai.basic.x1.adapter.port.dao.ModelDataResultDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDataResult;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.entity.ModelObjectBO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.util.IdUtil;
import cn.hutool.json.JSONUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ModelRecognitionUseCase {

    @Autowired
    private DataInfoUseCase dataInfoUseCase;

    @Autowired
    private Map<String, AbstractModelMessageHandler> modelMessageHandlerMap;

    @Autowired
    private ModelDataResultDAO modelDataResultDAO;

    @Transactional(rollbackFor = Exception.class)
    public ModelObjectBO recognition(ModelMessageBO modelMessage) {

        var modelDataResult = ModelDataResult.builder()
                .modelId(modelMessage.getModelId())
                .modelVersion(modelMessage.getModelVersion())
                .datasetId(modelMessage.getDatasetId())
                .modelSerialNo(modelMessage.getModelSerialNo())
                .resultFilterParam(JSONUtil.toJsonStr(modelMessage.getResultFilterParam()))
                .dataId(modelMessage.getDataId())
                .build();

        modelDataResultDAO.save(modelDataResult);


        modelMessageHandlerMap.values().stream()
                .filter(handler -> Objects.equals(handler.getModelCodeEnum(), modelMessage.getModelCode()))
                .findFirst().ifPresent(handler -> handler.modelRun(modelMessage));

        return dataInfoUseCase.getModelAnnotateResult(modelMessage.getModelSerialNo(),
                List.of(modelMessage.getDataId()));
    }

}
