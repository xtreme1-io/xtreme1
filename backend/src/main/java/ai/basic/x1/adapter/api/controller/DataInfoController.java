package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.annotation.user.LoggedUser;
import ai.basic.x1.adapter.dto.*;
import ai.basic.x1.entity.DataInfoQueryBO;
import ai.basic.x1.entity.DataInfoUploadBO;
import ai.basic.x1.usecase.DataInfoUseCase;
import ai.basic.x1.usecase.DatasetUseCase;
import ai.basic.x1.usecase.ExportUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * @author fyb
 * @date 2022/2/21 13:47
 */
@RestController
@RequestMapping("/data/")
@Validated
public class DataInfoController {

    @Autowired
    protected DataInfoUseCase dataInfoUsecase;

    @Autowired
    protected ExportUseCase exportUsecase;

    @Autowired
    protected DatasetUseCase datasetUseCase;


    @PostMapping("deleteBatch")
    public void deleteBatch(@RequestBody @Validated DataInfoDeleteDTO dto) {
        dataInfoUsecase.deleteBatch(dto.getIds());
    }

    @GetMapping("findByPage")
    public Page<DataInfoDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                        @RequestParam(defaultValue = "10") Integer pageSize, @Validated DataInfoQueryDTO dataInfoQueryDTO) {
        var dataInfoQueryBO = DefaultConverter.convert(dataInfoQueryDTO, DataInfoQueryBO.class);
        dataInfoQueryBO.setPageNo(pageNo);
        dataInfoQueryBO.setPageSize(pageSize);
        var dataInfoPage = dataInfoUsecase.findByPage(dataInfoQueryBO);
        var dataInfoDTOPage = DefaultConverter.convert(dataInfoPage, DataInfoDTO.class);
        return dataInfoDTOPage;
    }

    @GetMapping("generatePresignedUrl")
    public PresignedUrlDTO generatePresignedUrl(@RequestParam(value = "fileName") String fileName, @RequestParam(value = "datasetId") Long datasetId, @LoggedUser LoggedUserDTO userDTO) {
        var presignedUrlBO = dataInfoUsecase.generatePresignedUrl(fileName, datasetId, userDTO.getId());
        return DefaultConverter.convert(presignedUrlBO, PresignedUrlDTO.class);
    }

    /**
     * 上传data数据
     *
     * @param dto data数据对象
     */
    @PostMapping("upload")
    public void upload(@RequestBody @Validated DataInfoUploadDTO dto, @LoggedUser LoggedUserDTO userDTO) throws IOException {
        var dataInfoUploadBO = DefaultConverter.convert(dto, DataInfoUploadBO.class);
        dataInfoUploadBO.setUserId(userDTO.getId());
        dataInfoUsecase.upload(dataInfoUploadBO);
    }

}
