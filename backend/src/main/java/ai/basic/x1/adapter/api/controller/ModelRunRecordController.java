package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.ModelRunFilterDatasetDTO;
import ai.basic.x1.adapter.dto.ModelRunRecordDTO;
import ai.basic.x1.adapter.dto.request.RunRecordQueryDTO;
import ai.basic.x1.adapter.port.rpc.dto.DatasetModelResultDTO;
import ai.basic.x1.entity.ModelRunRecordBO;
import ai.basic.x1.entity.RunRecordQueryBO;
import ai.basic.x1.usecase.ModelRunRecordUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

/**
 * @author fyb
 * @version 1.0
 */
@RestController
@RequestMapping("/modelRun/")
public class ModelRunRecordController {

    @Autowired
    private ModelRunRecordUseCase modelRunRecordUseCase;

    @GetMapping("findAllModelRunRecord")
    public List<ModelRunRecordDTO> findAllModelRunRecord() {
        ModelRunRecordBO modelRunRecordBO = ModelRunRecordBO.builder().build();
        return DefaultConverter.convert(modelRunRecordUseCase.findAllModelRunRecord(modelRunRecordBO), ModelRunRecordDTO.class);
    }

    @GetMapping("findModelRunRecordByDatasetId/{datasetId}")
    public List<ModelRunRecordDTO> findModelRunRecordByDatasetId(@PathVariable("datasetId") Long datasetId) {
        ModelRunRecordBO modelRunRecordBO = ModelRunRecordBO.builder().datasetId(datasetId).build();
        return DefaultConverter.convert(modelRunRecordUseCase.findAllModelRunRecord(modelRunRecordBO), ModelRunRecordDTO.class);
    }

    @GetMapping("findModelRunRecordByPage")
    public Page<ModelRunRecordDTO> findModelRunRecordByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                                            @RequestParam(defaultValue = "10") Integer pageSize,
                                                            @Validated RunRecordQueryDTO dto) {
        var bo = DefaultConverter.convert(dto, RunRecordQueryBO.class);
        return DefaultConverter.convert(modelRunRecordUseCase.findModelRunRecordByPage(bo, pageNo, pageSize), ModelRunRecordDTO.class);
    }

    @GetMapping("findModelRunFilterDatasetName")
    public List<ModelRunFilterDatasetDTO> findModelRunFilterDatasetName(@RequestParam(required = false) String datasetName) {
        return DefaultConverter.convert(modelRunRecordUseCase.findModelRunFilterDatasetName(datasetName), ModelRunFilterDatasetDTO.class);
    }

    @PostMapping("delete/{id}")
    public void delete(@PathVariable("id") Long id) {
        modelRunRecordUseCase.deleteById(id);
    }

    @GetMapping("getDatasetModelRunResult/{datasetId}")
    public List<DatasetModelResultDTO> getDatasetModelRunResult(@PathVariable Long datasetId) {
        var datasetModelResultBOList = modelRunRecordUseCase.getDatasetModelRunResult(datasetId);
        return DefaultConverter.convert(datasetModelResultBOList, DatasetModelResultDTO.class);
    }

}
