package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.annotation.user.LoggedUser;
import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.dto.*;
import ai.basic.x1.adapter.dto.request.ModelAddDTO;
import ai.basic.x1.adapter.dto.request.ModelClassReqDTO;
import ai.basic.x1.adapter.dto.request.ModelRecognitionRequestDTO;
import ai.basic.x1.adapter.dto.request.ModelUpdateDTO;
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
import cn.hutool.json.JSONUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @PostMapping("/add")
    public void add(@RequestBody @Validated ModelAddDTO modelAddDTO) {
        modelUseCase.add(DefaultConverter.convert(modelAddDTO,ModelBO.class));
    }

    @PostMapping("/update")
    public void update(@RequestBody @Validated ModelUpdateDTO modelUpdateDTO) {
        modelUseCase.update(DefaultConverter.convert(modelUpdateDTO,ModelBO.class));
    }

    @PostMapping("/configurationModelClass")
    public void configurationModelClass(@RequestBody @Validated ModelClassReqDTO modelClassReqDTO) {
        modelUseCase.configurationModelClass(modelClassReqDTO.getModelId(),DefaultConverter.convert(modelClassReqDTO.getModelClassList(),ModelClassBO.class));
    }

    @PostMapping("/checkModelUrlConnection")
    public void checkModelUrlConnection(@NotEmpty(message ="url cannot be null") String url) {

    }

    @GetMapping("/page")
    public Page<ModelDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                     @RequestParam(defaultValue = "10") Integer pageSize, ModelDatasetTypeEnum datasetType) {
        return DefaultConverter.convert(modelUseCase.findByPage(pageNo,pageSize,datasetType),ModelDTO.class);
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
    public void modelRun(@RequestBody ModelRunDTO modelRunDTO) {
        ModelBO model = modelUseCase.getModelById(modelRunDTO.getModelId());
        ModelParamUtils.valid(modelRunDTO.getResultFilterParam(), model.getModelCode());
        modelUseCase.modelRun(
                DefaultConverter.convert(modelRunDTO, ModelRunBO.class)
        );
    }

    @PostMapping("reRun")
    public void reRun(@RequestBody ModelRunRecordDTO modelRunRecordDTO,
                      @LoggedUser LoggedUserDTO loggedUserDTO) {
        modelUseCase.reRun(
                DefaultConverter.convert(modelRunRecordDTO, ModelRunRecordBO.class),
                DefaultConverter.convert(loggedUserDTO, LoggedUserBO.class)
        );
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
