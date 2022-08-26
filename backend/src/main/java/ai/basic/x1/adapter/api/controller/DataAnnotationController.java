package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.DataAnnotationDTO;
import ai.basic.x1.adapter.dto.request.ObjectResultDTO;
import ai.basic.x1.entity.DataAnnotationBO;
import ai.basic.x1.usecase.DataAnnotationUseCase;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.util.ObjectUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotEmpty;
import javax.validation.groups.Default;
import java.util.ArrayList;
import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@RestController
@RequestMapping("/annotation/data/")
public class DataAnnotationController {

    @Autowired
    DataAnnotationUseCase dataAnnotationUseCase;

    @PostMapping("save")
    public void save(@Validated({Default.class, ObjectResultDTO.GroupAnnotation.class})@RequestBody ObjectResultDTO objectResultDTO){
        List<DataAnnotationDTO> dataAnnotationDTOs = convertToDataAnnotation(objectResultDTO);
        List<DataAnnotationBO> dataAnnotationBO = DefaultConverter.convert(dataAnnotationDTOs, DataAnnotationBO.class);
        dataAnnotationUseCase.saveDataAnnotation(dataAnnotationBO);
    }

    @GetMapping("listByDataIds")
    public List<DataAnnotationDTO> listByDataIds(@NotEmpty(message = "dataIds cannot be null") @RequestParam(required = false) List<Long> dataIds) {
        var dataAnnotations = DefaultConverter.convert(
                dataAnnotationUseCase.findByDataIds(dataIds), DataAnnotationDTO.class);
        return dataAnnotations;
    }

    private List<DataAnnotationDTO> convertToDataAnnotation(ObjectResultDTO objectResultDTO){
        List<DataAnnotationDTO> dataAnnotationDTOs = new ArrayList<>();
        for (ObjectResultDTO.DataInfo dataInfo:objectResultDTO.getDataInfos()){
            if (ObjectUtil.isNotEmpty(dataInfo.getDataAnnotations())) {
                dataInfo.getDataAnnotations().forEach(item -> {
                    DataAnnotationDTO dataAnnotationDTO = DataAnnotationDTO.builder()
                            .id(item.getId())
                            .datasetId(objectResultDTO.getDatasetId())
                            .dataId(dataInfo.getDataId())
                            .classificationId(item.getClassificationId())
                            .classificationAttributes(item.getClassificationAttributes())
                            .build();
                    dataAnnotationDTOs.add(dataAnnotationDTO);
                });
            }
        }
        return dataAnnotationDTOs;
    }
}
