package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.dto.ModelDTO;
import ai.basic.x1.adapter.dto.ModelObjectDTO;
import ai.basic.x1.adapter.dto.ModelRunDTO;
import ai.basic.x1.adapter.dto.ModelRunRecordDTO;
import ai.basic.x1.adapter.dto.request.*;
import ai.basic.x1.adapter.dto.response.ModelResponseDTO;
import ai.basic.x1.adapter.exception.ApiException;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.entity.enums.ModelDatasetTypeEnum;
import ai.basic.x1.usecase.DataInfoUseCase;
import ai.basic.x1.usecase.ModelRecognitionUseCase;
import ai.basic.x1.usecase.ModelUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.ModelParamUtils;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static ai.basic.x1.usecase.exception.UsecaseCode.PARAM_ERROR;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@RestController
@RequestMapping("/model")
@Validated
public class ModelController {

    @Autowired
    private DataInfoUseCase dataInfoUseCase;

    @Autowired
    private ModelUseCase modelUseCase;

    @Autowired
    private ModelRecognitionUseCase modelRecognitionUseCase;

    @PostMapping("/add")
    public ModelDTO add(@RequestBody @Validated ModelAddDTO modelAddDTO) {
        return DefaultConverter.convert(modelUseCase.add(DefaultConverter.convert(modelAddDTO, ModelBO.class)), ModelDTO.class);
    }

    @PostMapping("/update")
    public void update(@RequestBody @Validated ModelUpdateDTO modelUpdateDTO) {
        modelUseCase.update(DefaultConverter.convert(modelUpdateDTO, ModelBO.class));
    }

    @PostMapping("/configurationModelClass")
    public void configurationModelClass(@RequestBody @Validated ModelClassReqDTO modelClassReqDTO) {
        modelUseCase.configurationModelClass(modelClassReqDTO.getModelId(), DefaultConverter.convert(modelClassReqDTO.getModelClassList(), ModelClassBO.class));
    }

    @GetMapping("/list")
    public List<ModelDTO> list(ModelDTO modelDTO) {
        return DefaultConverter.convert(modelUseCase.list(DefaultConverter.convert(modelDTO, ModelBO.class)), ModelDTO.class);
    }

    @GetMapping("/page")
    public Page<ModelDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                     @RequestParam(defaultValue = "10") Integer pageSize, ModelDatasetTypeEnum datasetType) {
        return DefaultConverter.convert(modelUseCase.findByPage(pageNo, pageSize, datasetType), ModelDTO.class);
    }

    @GetMapping("info/{id}")
    public ModelDTO info(@PathVariable Long id) {
        return DefaultConverter.convert(modelUseCase.findById(id), ModelDTO.class);
    }

    @PostMapping("delete/{id}")
    public void delete(@PathVariable Long id) {
        modelUseCase.delete(id);
    }

    @PostMapping("modelRun")
    public void modelRun(@Validated(ModelRunFilterDataDTO.ModelRunGroup.class) @RequestBody ModelRunDTO modelRunDTO) {
        ModelBO model = modelUseCase.getModelById(modelRunDTO.getModelId());
        if (StrUtil.isEmpty(model.getUrl())) {
            throw new ApiException(PARAM_ERROR, "Please first configure the model URL.");
        }
        ModelParamUtils.valid(modelRunDTO.getResultFilterParam(), model.getModelCode());
        modelUseCase.modelRun(
                DefaultConverter.convert(modelRunDTO, ModelRunBO.class)
        );
    }

    @PostMapping("reRun")
    public void reRun(@Validated @RequestBody ModelRunRecordDTO modelRunRecordDTO) {
        modelUseCase.reRun(
                DefaultConverter.convert(modelRunRecordDTO, ModelRunRecordBO.class));
    }

    @GetMapping("modelRun/dataCount")
    public Long findModelRunDataCount(@Validated ModelRunFilterDataDTO modelRunDTO, @NotNull(message = "datasetId cannot be null") Long datasetId,
                                      @NotNull(message = "modelId cannot be null") Long modelId) {
        return dataInfoUseCase.findModelRunDataCount(DefaultConverter.convert(modelRunDTO, ModelRunFilterDataBO.class), datasetId, modelId);
    }

    @PostMapping("testModelUrlConnection")
    public ModelResponseDTO testModelUrlConnection(@Validated @RequestBody ModelUrlConnectionReqDTO modelUrlConnectionReqDTO) {
        return DefaultConverter.convert(modelUseCase.testModelUrlConnection(modelUrlConnectionReqDTO.getModelId(), modelUrlConnectionReqDTO.getUrl()), ModelResponseDTO.class);
    }

    @PostMapping("/image/recognition")
    public ModelObjectDTO recognition(@Validated @RequestBody ModelRecognitionRequestDTO modelRecognitionRequest) {
        return DefaultConverter.convert(modelRecognitionUseCase.recognition(buildModelMessageBO(modelRecognitionRequest, ModelCodeEnum.IMAGE_DETECTION)),
                ModelObjectDTO.class);
    }

    @PostMapping("/pointCloud/recognition")
    public ModelObjectDTO pointCloudRecognition(@Validated @RequestBody ModelRecognitionRequestDTO modelRecognitionRequest) {
        return DefaultConverter.convert(modelRecognitionUseCase.recognition(buildModelMessageBO(modelRecognitionRequest, ModelCodeEnum.LIDAR_DETECTION)),
                ModelObjectDTO.class);

    }

    private ModelMessageBO buildModelMessageBO(ModelRecognitionRequestDTO modelRecognitionRequest, ModelCodeEnum modelCodeEnum) {
        var dataInfo = dataInfoUseCase.findById(modelRecognitionRequest.getDataId());
        var model = modelUseCase.findByModelCode(modelCodeEnum);
        var preModelParam = modelRecognitionRequest.toPreModelParamDTO();
        if (model.getModelCode() == ModelCodeEnum.IMAGE_DETECTION) {
            preModelParam.setClasses(getImageClassLabelIds(model.getId(), modelRecognitionRequest.getClasses()));
        }
        var message = ModelMessageBO.builder()
                .dataInfo(dataInfo)
                .datasetId(dataInfo.getDatasetId())
                .dataId(dataInfo.getId())
                .modelId(model.getId())
                .modelCode(model.getModelCode())
                .modelVersion(model.getVersion())
                .modelSerialNo(IdUtil.getSnowflakeNextId())
                .resultFilterParam(JSONUtil.parseObj(preModelParam))
                .createdBy(RequestContextHolder.getContext().getUserInfo().getId())
                .build();
        return message;
    }

    private List<String> getImageClassLabelIds(Long modelId, List<String> classLabelNames) {
        var classLabelMap = modelUseCase.getModelClassMapByModelId(modelId)
                .entrySet().stream()
                .collect(Collectors.toMap(e -> e.getValue().getName().toUpperCase(), Map.Entry::getKey,
                        (o1, o2) -> o2));
        var classLabelIds = new ArrayList<String>();
        for (String classLabelName : classLabelNames) {
            classLabelName = classLabelName.replace('_', ' ').toUpperCase();
            if (classLabelMap.containsKey(classLabelName)) {
                classLabelIds.add(classLabelMap.get(classLabelName));
            }
        }
        return classLabelIds;
    }

}
