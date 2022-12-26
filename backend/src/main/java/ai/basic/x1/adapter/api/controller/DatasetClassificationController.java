package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.DatasetClassificationDTO;
import ai.basic.x1.adapter.dto.request.DatasetClassCopyDTO;
import ai.basic.x1.adapter.dto.request.DatasetClassificationCopyDTO;
import ai.basic.x1.entity.DatasetClassificationBO;
import ai.basic.x1.usecase.DatasetClassificationUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.ObjectUtil;
import org.springframework.util.Assert;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/3/11
 */
@RestController
@RequestMapping("/datasetClassification/")
public class DatasetClassificationController {

    private final DatasetClassificationUseCase datasetClassificationUseCase;

    public DatasetClassificationController(DatasetClassificationUseCase datasetClassificationUseCase) {
        this.datasetClassificationUseCase = datasetClassificationUseCase;
    }

    @PostMapping("create")
    public void create(@RequestBody @Validated DatasetClassificationDTO dto) {
        save(dto);
    }

    @PostMapping("update/{id}")
    public void update(@PathVariable Long id,
                       @RequestBody @Validated DatasetClassificationDTO dto) {
        dto.setId(id);
        save(dto);
    }

    @PostMapping("delete/{id}")
    public void delete(@PathVariable("id") Long id) {
        datasetClassificationUseCase.deleteClassification(id);
    }

    @PostMapping("/deleteByIds")
    public void delete(@RequestBody List<Long> ids) {
        if (ObjectUtil.isEmpty(ids)){
            throw new UsecaseException(UsecaseCode.UNKNOWN,"ID list can not be empty!");
        }
        datasetClassificationUseCase.deleteClassifications(ids);
    }

    @GetMapping("info/{id}")
    public DatasetClassificationDTO info(@PathVariable("id") Long id) {
        return DefaultConverter.convert(datasetClassificationUseCase.findById(id), DatasetClassificationDTO.class);
    }

    @GetMapping("findByPage")
    public Page<DatasetClassificationDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo, @RequestParam(defaultValue = "10") Integer pageSize, DatasetClassificationDTO datasetClassificationDTO) {
        DatasetClassificationBO datasetClassificationBO = DefaultConverter.convert(datasetClassificationDTO, DatasetClassificationBO.class);
        Assert.notNull(datasetClassificationBO, "param can not be null");
        Assert.notNull(datasetClassificationBO.getDatasetId(), "datasetId can not be null");
        return DefaultConverter.convert(datasetClassificationUseCase.findByPage(pageNo,
                pageSize, datasetClassificationBO), DatasetClassificationDTO.class);
    }

    @GetMapping("findAll/{datasetId}")
    public List<DatasetClassificationDTO> findAll(@PathVariable("datasetId") Long datasetId) {
        return DefaultConverter.convert(datasetClassificationUseCase.findAll(datasetId), DatasetClassificationDTO.class);
    }

    @PostMapping("/copyFromOntologyCenter")
    public void copyFromOntologyCenter(@RequestBody() @Validated DatasetClassificationCopyDTO datasetClassificationCopyDTO) {
        datasetClassificationUseCase.copyFromOntologyCenter(DefaultConverter.convert(datasetClassificationCopyDTO, DatasetClassificationBO.class));
    }

    @PostMapping("/saveToOntologyCenter")
    public void saveToOntologyCenter(@RequestBody() @Validated DatasetClassificationCopyDTO datasetClassificationCopyDTO) {
        datasetClassificationUseCase.saveToOntologyCenter(datasetClassificationCopyDTO.getOntologyId(),datasetClassificationCopyDTO.getClassificationIds());
    }

    /**
     * Check whether the classification name already exists in the same dataset
     * @return if exists return true
     */
    @GetMapping("validateName")
    public boolean validateName(@RequestParam Long datasetId, @RequestParam String name, @RequestParam(required = false) Long id) {
        return datasetClassificationUseCase.validateName(id, datasetId, name);
    }

    private void save(DatasetClassificationDTO datasetClassificationDTO) {
        DatasetClassificationBO datasetClassificationBO = DefaultConverter.convert(datasetClassificationDTO, DatasetClassificationBO.class);
        datasetClassificationUseCase.saveDatasetClassification(datasetClassificationBO);
    }
}
