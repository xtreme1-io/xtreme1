package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.DataAnnotationClassificationDTO;
import ai.basic.x1.adapter.dto.DataAnnotationObjectDTO;
import ai.basic.x1.adapter.dto.request.ObjectResultDTO;
import ai.basic.x1.adapter.dto.response.DataAnnotationObjectResponseDTO;
import ai.basic.x1.adapter.dto.response.DataAnnotationResultDTO;
import ai.basic.x1.entity.DataAnnotationClassificationBO;
import ai.basic.x1.entity.DataAnnotationObjectBO;
import ai.basic.x1.usecase.DataAnnotationUseCase;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.groups.Default;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@RestController
@RequestMapping("/annotate/data/")
public class DataAnnotationController {

    @Autowired
    DataAnnotationUseCase dataAnnotationUseCase;

    @PostMapping("save")
    public List<DataAnnotationObjectResponseDTO> save(@Validated @RequestBody ObjectResultDTO objectResultDTO) {
        List<DataAnnotationClassificationDTO> dataAnnotationClassificationDTOS = convertToDataAnnotation(objectResultDTO);
        List<DataAnnotationObjectDTO> dataAnnotationObjectDTOs = convertToDataAnnotationObject(objectResultDTO);
        var deleteDataIds = objectResultDTO.getDataInfos()
                .stream()
                .filter(dataInfo -> CollUtil.isEmpty(dataInfo.getObjects()))
                .map(ObjectResultDTO.DataInfo::getDataId).collect(Collectors.toSet());
        List<DataAnnotationClassificationBO> dataAnnotationClassificationBOs = DefaultConverter.convert(dataAnnotationClassificationDTOS, DataAnnotationClassificationBO.class);
        List<DataAnnotationObjectBO> dataAnnotationObjectBOs = DefaultConverter.convert(dataAnnotationObjectDTOs, DataAnnotationObjectBO.class);
        List<DataAnnotationObjectBO> result = dataAnnotationUseCase.saveDataAnnotation(dataAnnotationClassificationBOs, dataAnnotationObjectBOs, deleteDataIds);
        return DefaultConverter.convert(result, DataAnnotationObjectResponseDTO.class);
    }

    @GetMapping("listByDataIds")
    public List<DataAnnotationResultDTO> listByDataIds(@RequestParam List<Long> dataIds) {
        return DefaultConverter.convert(dataAnnotationUseCase.findByDataIds(dataIds), DataAnnotationResultDTO.class);
    }

    private List<DataAnnotationClassificationDTO> convertToDataAnnotation(ObjectResultDTO objectResultDTO) {
        List<DataAnnotationClassificationDTO> dataAnnotationClassificationDTOS = new ArrayList<>();
        for (ObjectResultDTO.DataInfo dataInfo : objectResultDTO.getDataInfos()) {
            if (ObjectUtil.isNotEmpty(dataInfo.getDataAnnotations())) {
                dataInfo.getDataAnnotations().forEach(item -> {
                    DataAnnotationClassificationDTO dataAnnotationClassificationDTO = DataAnnotationClassificationDTO.builder()
                            .id(item.getId())
                            .datasetId(objectResultDTO.getDatasetId())
                            .dataId(dataInfo.getDataId())
                            .classificationId(item.getClassificationId())
                            .classificationAttributes(item.getClassificationAttributes())
                            .build();
                    dataAnnotationClassificationDTOS.add(dataAnnotationClassificationDTO);
                });
            }
        }
        return dataAnnotationClassificationDTOS;
    }

    private List<DataAnnotationObjectDTO> convertToDataAnnotationObject(ObjectResultDTO objectResultDTO) {
        List<DataAnnotationObjectDTO> dataAnnotationObjectDTOs = new ArrayList<>();
        for (ObjectResultDTO.DataInfo dataInfo : objectResultDTO.getDataInfos()) {
            if (ObjectUtil.isNotNull(dataInfo.getObjects())) {
                dataInfo.getObjects().forEach(item -> {
                    DataAnnotationObjectDTO dataAnnotationDTO = DefaultConverter.convert(item, DataAnnotationObjectDTO.class);
                    dataAnnotationDTO.setDatasetId(objectResultDTO.getDatasetId());
                    dataAnnotationDTO.setDataId(dataInfo.getDataId());
                    dataAnnotationObjectDTOs.add(dataAnnotationDTO);
                });
            }
        }
        return dataAnnotationObjectDTOs;
    }
}
