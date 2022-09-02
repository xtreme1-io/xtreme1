package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.DataAnnotationObjectDTO;
import ai.basic.x1.adapter.dto.request.ObjectResultDTO;
import ai.basic.x1.adapter.dto.response.DataAnnotationObjectResponseDTO;
import ai.basic.x1.adapter.dto.response.DataAnnotationObjectResultDTO;
import ai.basic.x1.entity.DataAnnotationObjectBO;
import ai.basic.x1.usecase.DataAnnotationObjectUseCase;
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
@RequestMapping("/annotate/object")
public class DataAnnotationObjectController {

    @Autowired
    private DataAnnotationObjectUseCase dataAnnotationObjectUseCase;

    @PostMapping("/save")
    public List<DataAnnotationObjectResponseDTO> save(@RequestBody @Validated({Default.class, ObjectResultDTO.GroupObject.class}) ObjectResultDTO objectResultDTO) {
        var dataAnnotationObjectDTOs = convertToDataAnnotationObject(objectResultDTO);
        var dataAnnotationObjectBOs = DefaultConverter.convert(dataAnnotationObjectDTOs, DataAnnotationObjectBO.class);
        var deleteDataIds = objectResultDTO.getDataInfos()
                .stream()
                .filter(dataInfo -> CollUtil.isEmpty(dataInfo.getObjects()))
                .map(ObjectResultDTO.DataInfo::getDataId).collect(Collectors.toSet());
        var dataAnnotationObjectResultBOs = dataAnnotationObjectUseCase.saveDataAnnotationObject(dataAnnotationObjectBOs, deleteDataIds);
        return DefaultConverter.convert(dataAnnotationObjectResultBOs, DataAnnotationObjectResponseDTO.class);
    }

    @GetMapping("/listByDataIds")
    public DataAnnotationObjectResultDTO listByDataIds(@RequestParam List<Long> dataIds) {
        var dataAnnotationObjects = DefaultConverter.convert(
                dataAnnotationObjectUseCase.findByDataIds(dataIds), DataAnnotationObjectDTO.class);
        return DataAnnotationObjectResultDTO.builder().dataAnnotationObjects(dataAnnotationObjects).build();
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
