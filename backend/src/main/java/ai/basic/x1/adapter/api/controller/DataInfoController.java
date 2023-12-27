package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.annotation.user.LoggedUser;
import ai.basic.x1.adapter.dto.*;
import ai.basic.x1.adapter.dto.request.DataInfoSplitFilterDTO;
import ai.basic.x1.adapter.dto.request.DataInfoSplitReqDTO;
import ai.basic.x1.adapter.exception.ApiException;
import ai.basic.x1.adapter.port.rpc.dto.DatasetModelResultDTO;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.entity.enums.ScenarioQuerySourceEnum;
import ai.basic.x1.entity.enums.SplitTargetDataTypeEnum;
import ai.basic.x1.entity.enums.SplitTypeEnum;
import ai.basic.x1.usecase.*;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.ModelParamUtils;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.EnumUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author fyb
 * @date 2022/2/21 13:47
 */
@RestController
@RequestMapping("/data/")
@Validated
@Slf4j
public class DataInfoController extends BaseDatasetController {

    @Autowired
    protected DataInfoUseCase dataInfoUsecase;

    @Autowired
    protected ExportUseCase exportUsecase;

    @Autowired
    protected UploadUseCase uploadUseCase;

    @Autowired
    protected DatasetUseCase datasetUseCase;

    @Autowired
    protected DataAnnotationRecordUseCase dataAnnotationRecordUseCase;

    @Autowired
    protected DataAnnotationObjectUseCase dataAnnotationObjectUseCase;

    @Autowired
    protected ClassUseCase classUseCase;

    @Autowired
    private DataClassificationOptionUseCase dataClassificationOptionUseCase;

    @Autowired
    protected UploadDataUseCase uploadDataUseCase;

    @PostMapping("upload")
    public String upload(@RequestBody @Validated DataInfoUploadDTO dto, @LoggedUser LoggedUserDTO userDTO) throws IOException {
        var dataInfoUploadBO = DefaultConverter.convert(dto, DataInfoUploadBO.class);
        assert dataInfoUploadBO != null;
        dataInfoUploadBO.setUserId(userDTO.getId());
        return String.valueOf(uploadDataUseCase.upload(dataInfoUploadBO));
    }

    @GetMapping("findUploadRecordBySerialNumbers")
    public List<UploadRecordDTO> findUploadRecordBySerialNumbers(
            @NotEmpty(message = "serialNumbers cannot be null") @RequestParam(required = false) List<String> serialNumbers) {
        var uploadRecordBOList = uploadUseCase.findBySerialNumbers(serialNumbers);
        return DefaultConverter.convert(uploadRecordBOList, UploadRecordDTO.class);
    }

    @GetMapping("findByPage")
    public Page<DataInfoDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                        @RequestParam(defaultValue = "10") Integer pageSize, @Validated DataInfoQueryDTO dataInfoQueryDTO) {
        var dataInfoQueryBO = DefaultConverter.convert(dataInfoQueryDTO, DataInfoQueryBO.class);
        assert dataInfoQueryBO != null;
        dataInfoQueryBO.setPageNo(pageNo);
        dataInfoQueryBO.setPageSize(pageSize);
        var dataInfoPage = dataInfoUsecase.findByPage(dataInfoQueryBO);
        return dataInfoPage.convert(this::convertDataInfoDTO);
    }

    @GetMapping("info/{id}")
    public DataInfoDTO info(@PathVariable Long id) {
        var dataInfoBO = dataInfoUsecase.findById(id);
        return convertDataInfoDTO(dataInfoBO);
    }

    @GetMapping("listByIds")
    public List<DataInfoDTO> listByIds(@NotEmpty(message = "dataIds cannot be null") @RequestParam(required = false) List<Long> dataIds) {
        var dataInfoBos = dataInfoUsecase.listByIds(dataIds, false);
        if (CollectionUtil.isNotEmpty(dataInfoBos)) {
            return dataInfoBos.stream().map(this::convertDataInfoDTO).collect(Collectors.toList());
        }
        return List.of();
    }

    @GetMapping("listRelationByIds")
    public List<DataInfoDTO> listRelationByIds(@NotEmpty(message = "dataIds cannot be null") @RequestParam(required = false) List<Long> dataIds) {
        var dataInfoBos = dataInfoUsecase.listRelationByIds(dataIds, false);
        if (CollectionUtil.isNotEmpty(dataInfoBos)) {
            return dataInfoBos.stream().map(this::convertDataInfoDTO).collect(Collectors.toList());
        }
        return List.of();
    }

    @GetMapping("getDataStatusByIds")
    public List<DataInfoStatusDTO> getDataStatusByIds(@NotEmpty(message = "dataIds cannot be null") @RequestParam(required = false) List<Long> dataIds) {
        var dataInfoBOS = dataInfoUsecase.getDataStatusByIds(dataIds);
        return DefaultConverter.convert(dataInfoBOS, DataInfoStatusDTO.class);
    }

    @GetMapping("getAnnotationStatusStatisticsByDatasetId")
    public DatasetStatisticsDTO getAnnotationStatusStatisticsByDatasetId(
            @NotNull(message = "DatasetId cannot be null") @RequestParam(required = false) Long datasetId) {
        return DefaultConverter.convert(dataInfoUsecase.getDatasetStatisticsByDatasetId(datasetId), DatasetStatisticsDTO.class);
    }

    @GetMapping("findLockRecordIdByDatasetId")
    public LockRecordDTO findLockRecordIdByDatasetId(@NotNull(message = "datasetId cannot be null") @RequestParam(required = false) Long datasetId,
                                                     @LoggedUser LoggedUserDTO userDTO) {
        var lockRecordBO = dataAnnotationRecordUseCase.findLockRecordIdByDatasetId(datasetId, userDTO.getId());
        return DefaultConverter.convert(lockRecordBO, LockRecordDTO.class);
    }

    @PostMapping("unLock/{id}")
    public void unLockByRecordId(@PathVariable Long id, @LoggedUser LoggedUserDTO userDTO) {
        dataAnnotationRecordUseCase.unLockByRecordId(id, userDTO.getId());
    }

    @PostMapping("removeModelDataResult")
    public void removeModelDataResult(@RequestBody @Validated RemoveModelDataResultDTO removeModelDataResultDTO) {
        dataAnnotationRecordUseCase.removeModelDataResult(removeModelDataResultDTO.getSerialNo(), removeModelDataResultDTO.getDataIds());
    }

    @GetMapping("findDataAnnotationRecord/{id}")
    public DataAnnotationRecordDTO findDataIdsByRecordId(@PathVariable Long id, @LoggedUser LoggedUserDTO userDTO) {
        var dataAnnotationRecordBO = dataAnnotationRecordUseCase.findDataAnnotationRecordById(id, userDTO.getId());
        return DefaultConverter.convert(dataAnnotationRecordBO, DataAnnotationRecordDTO.class);
    }

    @GetMapping("findLockRecordByDatasetId")
    public List<LockRecordDTO> findLockRecordByDatasetId(@NotNull(message = "datasetId cannot be null") @RequestParam(required = false) Long datasetId) {
        return DefaultConverter.convert(dataAnnotationRecordUseCase.findLockRecordByDatasetId(datasetId), LockRecordDTO.class);
    }

    @PostMapping("unLockByLockRecordIds")
    public void unLockByLockRecordIds(@RequestBody @Validated DataBatchUnlockDTO dataBatchUnlockDTO) {
        dataAnnotationRecordUseCase.unLockByLockRecordIds(dataBatchUnlockDTO.getLockRecordIds());
    }

    @PostMapping("split/dataIds")
    public void splitByDataIds(@RequestBody @Validated DataInfoSplitReqDTO dto) {
        dataInfoUsecase.splitByDataIds(dto.getDataIds(), EnumUtil.fromString(SplitTypeEnum.class, dto.getSplitType()));
    }

    @PostMapping("split/filter")
    public void splitByFilter(@RequestBody @Validated DataInfoSplitFilterDTO dto) {
        dataInfoUsecase.splitByFilter(DefaultConverter.convert(dto, DataInfoSplitFilterBO.class));
    }

    @GetMapping("split/totalDataCount")
    public Long getSplitDataTotalCount(@NotNull(message = "datasetId cannot be null") @RequestParam(required = false) Long datasetId,
                                       @RequestParam(value = "targetDataType", required = false) SplitTargetDataTypeEnum targetDataType) {
        return dataInfoUsecase.getSplitDataTotalCount(datasetId, targetDataType);
    }

    @PostMapping("deleteBatch")
    public void deleteBatch(@RequestBody @Validated DataInfoDeleteDTO dto) {
        dataInfoUsecase.deleteBatch(dto.getDatasetId(), dto.getIds());
    }

    @GetMapping("generatePresignedUrl")
    public PresignedUrlDTO generatePresignedUrl(@RequestParam(value = "fileName") String fileName,
                                                @RequestParam(value = "datasetId") Long datasetId, @LoggedUser LoggedUserDTO userDTO) {
        var presignedUrlBO = dataInfoUsecase.generatePresignedUrl(fileName, datasetId, userDTO.getId());
        return DefaultConverter.convert(presignedUrlBO, PresignedUrlDTO.class);
    }

    @GetMapping("export")
    public String export(@Validated DataInfoQueryDTO dataInfoQueryDTO) {
        var dataInfoQueryBO = DefaultConverter.convert(dataInfoQueryDTO, DataInfoQueryBO.class);
        assert dataInfoQueryBO != null;
        return String.valueOf(dataInfoUsecase.export(dataInfoQueryBO));
    }

    @GetMapping("findExportRecordBySerialNumbers")
    public List<ExportRecordDTO> findExportRecordBySerialNumber(
            @NotEmpty(message = "serialNumbers cannot be null") @RequestParam(required = false) List<String> serialNumbers) {
        var exportRecordList = exportUsecase.findExportRecordBySerialNumbers(serialNumbers);
        return DefaultConverter.convert(exportRecordList, ExportRecordDTO.class);
    }

    @PostMapping("annotate")
    public Long annotate(@Validated @RequestBody DataAnnotateDTO dataAnnotateDTO, @LoggedUser LoggedUserDTO loggedUserDTO) {
        return dataInfoUsecase.annotate(
                DefaultConverter.convert(dataAnnotateDTO, DataPreAnnotationBO.class),
                loggedUserDTO.getId());
    }

    @PostMapping("annotateWithModel")
    public Long annotateWithModel(@Validated @RequestBody DataModelAnnotateDTO dataModelAnnotateDTO, @LoggedUser LoggedUserDTO loggedUserDTO) {
        var resultFilterParam = dataModelAnnotateDTO.getResultFilterParam();
        var modelCode = EnumUtil.fromString(ModelCodeEnum.class, dataModelAnnotateDTO.getModelCode());
        ModelParamUtils.valid(resultFilterParam, modelCode);
        return dataInfoUsecase.annotateWithModel(
                DefaultConverter.convert(dataModelAnnotateDTO, DataPreAnnotationBO.class),
                loggedUserDTO.getId()
        );
    }

    @PostMapping("modelAnnotate")
    public String modelAnnotate(@Validated @RequestBody DataModelAnnotateDTO dataModelAnnotateDTO, @LoggedUser LoggedUserDTO loggedUserDTO) {
        var resultFilterParam = dataModelAnnotateDTO.getResultFilterParam();
        var modelCode = EnumUtil.fromString(ModelCodeEnum.class, dataModelAnnotateDTO.getModelCode());
        ModelParamUtils.valid(resultFilterParam, modelCode);
        return dataInfoUsecase.modelAnnotate(DefaultConverter.convert(dataModelAnnotateDTO, DataPreAnnotationBO.class),
                loggedUserDTO.getId());
    }

    @GetMapping("modelAnnotationResult")
    public ModelObjectDTO modelAnnotationResult(@NotNull(message = "serialNo cannot be null") @RequestParam(required = false) Long serialNo,
                                                @RequestParam(required = false) List<Long> dataIds) {
        var modelObjectBO = dataInfoUsecase.getModelAnnotateResult(serialNo, dataIds);
        return DefaultConverter.convert(modelObjectBO, ModelObjectDTO.class);
    }

    @GetMapping("findByScenarioPage")
    public Page<DataAnnotationObjectDTO> findByScenarioPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                                            @RequestParam(defaultValue = "10") Integer pageSize,
                                                            @Validated ScenarioQueryDTO dto) {
        var scenarioQueryBO = DefaultConverter.convert(dto, ScenarioQueryBO.class);
        if (dto.getSource().equals(ScenarioQuerySourceEnum.ONTOLOGY.name())) {
            var datasetClassIds = classUseCase.findDatasetClassIdsByClassId(dto.getClassId());
            if (CollectionUtil.isEmpty(datasetClassIds)) {
                return new Page<>();
            }
            scenarioQueryBO.setClassIds(datasetClassIds);
        } else {
            scenarioQueryBO.setClassIds(Collections.singletonList(dto.getClassId()));
        }
        var page = dataAnnotationObjectUseCase.findByScenarioPage(pageNo, pageSize, scenarioQueryBO);
        return DefaultConverter.convert(page, DataAnnotationObjectDTO.class);
    }

    @GetMapping("classificationOption/findAll")
    public List<DataClassificationOptionDTO> findClassificationOption(@RequestParam Long classId) {
        var options = dataClassificationOptionUseCase.findByClassIds(List.of(classId));
        return DefaultConverter.convert(options, DataClassificationOptionDTO.class);
    }

    @GetMapping("scenarioExport")
    public String scenarioExport(@Validated ScenarioQueryDTO scenarioQueryDTO) {
        var scenarioQueryBO = DefaultConverter.convert(scenarioQueryDTO, ScenarioQueryBO.class);
        if (scenarioQueryDTO.getSource().equals(ScenarioQuerySourceEnum.ONTOLOGY.name())) {
            var datasetClassIds = classUseCase.findDatasetClassIdsByClassId(scenarioQueryDTO.getClassId());
            if (CollectionUtil.isEmpty(datasetClassIds)) {
                throw new ApiException(UsecaseCode.DATASET_DATA_SCENARIO_NOT_FOUND);
            }
            scenarioQueryBO.setClassIds(datasetClassIds);
        } else {
            scenarioQueryBO.setClassIds(Collections.singletonList(scenarioQueryDTO.getClassId()));
        }
        return String.valueOf(dataInfoUsecase.scenarioExport(scenarioQueryBO));
    }

    @GetMapping("getDataAndResult")
    public JSONObject getDataAndResult(@NotNull(message = "cannot be null") @RequestParam(required = false) Long datasetId, @RequestParam(required = false) List<Long> dataIds) {
        return JSONUtil.parseObj(JSONUtil.toJsonStr(dataInfoUsecase.getDataAndResult(datasetId, dataIds)));
    }

    @GetMapping("getDataModelRunResult/{dataId}")
    public List<DatasetModelResultDTO> getDataModelRunResult(@PathVariable Long dataId) {
        return DefaultConverter.convert(dataAnnotationObjectUseCase.getDataModelRunResult(dataId), DatasetModelResultDTO.class);
    }

    @GetMapping("/getDataIdBySceneIds")
    public Map<Long, List<Long>> getDataIdBySceneIds(@NotNull(message = "datasetId cannot be null") @RequestParam(required = false) Long datasetId,
                                                     @NotEmpty(message = "sceneIds cannot be null") @RequestParam(required = false) List<Long> sceneIds) {
        return dataInfoUsecase.getDataIdBySceneIds(datasetId, sceneIds);
    }

}
