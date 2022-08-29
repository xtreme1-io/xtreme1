package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.annotation.user.LoggedUser;
import ai.basic.x1.adapter.dto.*;
import ai.basic.x1.entity.DataInfoQueryBO;
import ai.basic.x1.entity.DataInfoUploadBO;
import ai.basic.x1.entity.DataPreAnnotationBO;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.DataAnnotationRecordUseCase;
import ai.basic.x1.usecase.DataInfoUseCase;
import ai.basic.x1.usecase.DatasetUseCase;
import ai.basic.x1.usecase.ExportUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.ModelParamUtils;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.EnumUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author fyb
 * @date 2022/2/21 13:47
 */
@RestController
@RequestMapping("/data/")
@Validated
public class DataInfoController extends DatasetBaseController {

    @Autowired
    protected DataInfoUseCase dataInfoUsecase;

    @Autowired
    protected ExportUseCase exportUsecase;

    @Autowired
    protected DatasetUseCase datasetUseCase;

    @Autowired
    protected DataAnnotationRecordUseCase dataAnnotationRecordUseCase;

    /**
     * 上传data数据
     *
     * @param dto data数据对象
     */
    @PostMapping("upload")
    public void upload(@RequestBody @Validated DataInfoUploadDTO dto, @LoggedUser LoggedUserDTO userDTO) throws IOException {
        var dataInfoUploadBO = DefaultConverter.convert(dto, DataInfoUploadBO.class);
        assert dataInfoUploadBO != null;
        dataInfoUploadBO.setUserId(userDTO.getId());
        dataInfoUsecase.upload(dataInfoUploadBO);
    }


    @GetMapping("findByPage")
    public Page<DataInfoDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                        @RequestParam(defaultValue = "10") Integer pageSize, @Validated DataInfoQueryDTO dataInfoQueryDTO) {
        var dataInfoQueryBO = DefaultConverter.convert(dataInfoQueryDTO, DataInfoQueryBO.class);
        assert dataInfoQueryBO != null;
        dataInfoQueryBO.setPageNo(pageNo);
        dataInfoQueryBO.setPageSize(pageSize);
        var dataInfoPage = dataInfoUsecase.findByPage(dataInfoQueryBO);
        return dataInfoPage.convert(dataInfoBO -> convertDataInfoDTO(dataInfoBO));
    }

    @GetMapping("info/{id}")
    public DataInfoDTO info(@PathVariable Long id) {
        var dataInfoBO = dataInfoUsecase.findById(id);
        return convertDataInfoDTO(dataInfoBO);
    }

    @GetMapping("listByIds")
    public List<DataInfoDTO> listByIds(@NotEmpty(message = "DataIds cannot be null") @RequestParam(required = false) List<Long> dataIds) {
        var dataInfoBos = dataInfoUsecase.listByIds(dataIds);
        if (CollectionUtil.isNotEmpty(dataInfoBos)) {
            return dataInfoBos.stream().map(dataInfoBO -> convertDataInfoDTO(dataInfoBO)).collect(Collectors.toList());
        }
        return List.of();
    }

    @GetMapping("findLockRecordIdByDatasetId")
    public LockRecordDTO findLockRecordIdByDatasetId(@NotNull(message = "DatasetId cannot be null") @RequestParam(required = false) Long datasetId,
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

    @PostMapping("deleteBatch")
    public void deleteBatch(@RequestBody @Validated DataInfoDeleteDTO dto) {
        dataInfoUsecase.deleteBatch(dto.getIds());
    }

    @GetMapping("generatePresignedUrl")
    public PresignedUrlDTO generatePresignedUrl(@RequestParam(value = "fileName") String fileName, @RequestParam(value = "datasetId") Long datasetId, @LoggedUser LoggedUserDTO userDTO) {
        var presignedUrlBO = dataInfoUsecase.generatePresignedUrl(fileName, datasetId, userDTO.getId());
        return DefaultConverter.convert(presignedUrlBO, PresignedUrlDTO.class);
    }


    @GetMapping("export")
    public Long export(@Validated DataInfoQueryDTO dataInfoQueryDTO) {
        var dataInfoQueryBO = DefaultConverter.convert(dataInfoQueryDTO, DataInfoQueryBO.class);
        assert dataInfoQueryBO != null;
        return dataInfoUsecase.export(dataInfoQueryBO);
    }

    @GetMapping("findExportRecordBySerialNumbers")
    public List<ExportRecordDTO> findExportRecordBySerialNumber(@NotEmpty(message = "SerialNumbers cannot be null") @RequestParam(required = false) List<String> serialNumbers) {
        var exportRecordList = exportUsecase.findExportRecordBySerialNumbers(serialNumbers);
        return DefaultConverter.convert(exportRecordList, ExportRecordDTO.class);
    }

    @PostMapping("annotate")
    public Long annotate(@Validated @RequestBody DataAnnotateDTO dataAnnotateDTO, @LoggedUser LoggedUserDTO loggedUserDTO) {
        return dataInfoUsecase.annotate(
                DefaultConverter.convert(dataAnnotateDTO, DataPreAnnotationBO.class),
                loggedUserDTO.getId()
        );
    }

    @PostMapping("annotateWithModel")
    public Long annotateWithModel(@Validated @RequestBody DataModelAnnotateDTO dataModelAnnotateDTO, @LoggedUser LoggedUserDTO loggedUserDTO) {
        var resultFilterParam = dataModelAnnotateDTO.getResultFilterParam();
        var modelCode = EnumUtil.fromString(ModelCodeEnum.class, dataModelAnnotateDTO.getModelCode());
        ModelParamUtils.valid(resultFilterParam, modelCode);
        return dataInfoUsecase.annotate(
                DefaultConverter.convert(dataModelAnnotateDTO, DataPreAnnotationBO.class),
                loggedUserDTO.getId()
        );
    }

    @PostMapping("modelAnnotate")
    public Long modelAnnotate(@Validated @RequestBody DataModelAnnotateDTO dataModelAnnotateDTO, @LoggedUser LoggedUserDTO loggedUserDTO) {
        var resultFilterParam = dataModelAnnotateDTO.getResultFilterParam();
        var modelCode = EnumUtil.fromString(ModelCodeEnum.class, dataModelAnnotateDTO.getModelCode());
        ModelParamUtils.valid(resultFilterParam, modelCode);
        return dataInfoUsecase.modelAnnotate(DefaultConverter.convert(dataModelAnnotateDTO, DataPreAnnotationBO.class),
                loggedUserDTO.getId());
    }

    @GetMapping("modelAnnotationResult")
    public ModelObjectDTO modelAnnotationResult(@NotNull(message = "serialNo cannot be null") @RequestParam(required = false) Long serialNo, @RequestParam(required = false) List<Long> dataIds) {
        var modelObjectBO = dataInfoUsecase.getModelAnnotateResult(serialNo, dataIds);
        return DefaultConverter.convert(modelObjectBO, ModelObjectDTO.class);
    }

}
