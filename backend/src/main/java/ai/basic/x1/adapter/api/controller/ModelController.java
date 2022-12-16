package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.dto.ModelDTO;
import ai.basic.x1.adapter.dto.ModelObjectDTO;
import ai.basic.x1.adapter.dto.request.ModelRecognitionRequestDTO;
import ai.basic.x1.entity.ModelBO;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.DataInfoUseCase;
import ai.basic.x1.usecase.ModelRecognitionUseCase;
import ai.basic.x1.usecase.ModelUseCase;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.util.IdUtil;
import cn.hutool.json.JSONUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@RestController
@RequestMapping("/model")
public class ModelController {

    @Autowired
    private DataInfoUseCase dataInfoUseCase;

    @Autowired
    private ModelUseCase modelUseCase;

    @Autowired
    private ModelRecognitionUseCase modelRecognitionUseCase;

    @GetMapping("/list")
    public List<ModelDTO> findAll(ModelDTO modelDTO) {
        return DefaultConverter.convert(modelUseCase.findAll(DefaultConverter.convert(modelDTO, ModelBO.class)), ModelDTO.class);
    }

    @GetMapping("info/{id}")
    public ModelDTO info(@PathVariable Long id) {
        return DefaultConverter.convert(modelUseCase.findById(id), ModelDTO.class);
    }

    @PostMapping("/image/recognition")
    public ModelObjectDTO recognition(@Validated @RequestBody ModelRecognitionRequestDTO modelRecognitionRequest) {
        return DefaultConverter.convert(modelRecognitionUseCase.recognition(buildModelMessageBO(modelRecognitionRequest, ModelCodeEnum.COCO_80)),
                ModelObjectDTO.class);
    }

    @PostMapping("/pointCloud/recognition")
    public ModelObjectDTO pointCloudRecognition(@Validated @RequestBody ModelRecognitionRequestDTO modelRecognitionRequest) {
        return DefaultConverter.convert(modelRecognitionUseCase.recognition(buildModelMessageBO(modelRecognitionRequest, ModelCodeEnum.PRE_LABEL)),
                ModelObjectDTO.class);

    }

    private ModelMessageBO buildModelMessageBO(ModelRecognitionRequestDTO modelRecognitionRequest, ModelCodeEnum modelCodeEnum) {
        var dataInfo = dataInfoUseCase.findById(modelRecognitionRequest.getDataId());
        var model = modelUseCase.findByModelCode(modelCodeEnum);
        var message = ModelMessageBO.builder()
                .dataInfo(dataInfo)
                .datasetId(dataInfo.getDatasetId())
                .dataId(dataInfo.getId())
                .modelId(model.getId())
                .modelCode(model.getModelCode())
                .modelVersion(model.getVersion())
                .modelSerialNo(IdUtil.getSnowflakeNextId())
                .resultFilterParam(JSONUtil.parseObj(modelRecognitionRequest.toPreModelParamDTO()))
                .createdBy(RequestContextHolder.getContext().getUserInfo().getId())
                .build();
        return message;
    }

}
