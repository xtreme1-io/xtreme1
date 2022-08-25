package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.DatasetClassDTO;
import ai.basic.x1.adapter.dto.DatasetClassificationDTO;
import ai.basic.x1.entity.DatasetClassificationBO;
import ai.basic.x1.usecase.DatasetClassificationUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import ai.basic.x1.util.lock.IDistributedLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.groups.Default;
import java.util.List;

/**
 * @author chenchao
 * @date 2022/3/11
 */
@RestController
@RequestMapping("/datasetClassification/")
public class DatasetClassificationController {

    private final DatasetClassificationUseCase datasetClassificationUseCase;

    @Autowired
    private IDistributedLock distributedLock;

    public DatasetClassificationController(DatasetClassificationUseCase datasetClassificationUseCase) {
        this.datasetClassificationUseCase = datasetClassificationUseCase;
    }

    @PostMapping("create")
    public void create(@RequestBody @Validated({Default.class, DatasetClassDTO.GroupSave.class}) DatasetClassificationDTO dto) {
        save(dto);
    }

    @PostMapping("update/{id}")
    public void update(@PathVariable Long id,
                       @RequestBody @Validated({Default.class, DatasetClassificationDTO.GroupSave.class}) DatasetClassificationDTO dto) {
        dto.setId(id);
        save(dto);
    }

    @PostMapping("delete/{id}")
    public void delete(@PathVariable("id") Long id) {
        datasetClassificationUseCase.deleteClassification(id);
    }

    @GetMapping("info/{id}")
    public DatasetClassificationDTO info(@PathVariable("id") Long id) {
        return DefaultConverter.convert(datasetClassificationUseCase.findById(id), DatasetClassificationDTO.class);
    }

    @GetMapping("findByPage")
    public Page<DatasetClassificationDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo, @RequestParam(defaultValue = "10") Integer pageSize, @Valid DatasetClassificationDTO datasetClassificationDTO) {
        DatasetClassificationBO datasetClassificationBO = DefaultConverter.convert(datasetClassificationDTO, DatasetClassificationBO.class);
        return DefaultConverter.convert(datasetClassificationUseCase.findByPage(pageNo,
                pageSize, datasetClassificationBO), DatasetClassificationDTO.class);
    }

    @GetMapping("findAll/{datasetId}")
    public List<DatasetClassificationDTO> findAll(@PathVariable("datasetId") Long datasetId) {
        return DefaultConverter.convert(datasetClassificationUseCase.findAll(datasetId), DatasetClassificationDTO.class);
    }

    /**
     * Check whether the classification name already exists in the same dataset
     * @return if exists return true
     */
    @GetMapping("validateName")
    public boolean validateName(@RequestParam Long datasetId, @RequestParam String name,@RequestParam(required = false) Long id) {
        return datasetClassificationUseCase.nameExists(DatasetClassificationBO.builder().id(id).datasetId(datasetId).name(name).build());
    }

    private void save(@RequestBody @Validated({Default.class, DatasetClassificationDTO.GroupSave.class}) DatasetClassificationDTO datasetClassificationDTO) {
        DatasetClassificationBO datasetClassificationBO = DefaultConverter.convert(datasetClassificationDTO, DatasetClassificationBO.class);

        var lockKey = String.format("%s:%s:%s", "datasetClassification", "datasetId+classificationName", datasetClassificationBO.getDatasetId() + "+" + datasetClassificationBO.getName());
        var boo = distributedLock.tryLock(lockKey, 1000);
        try {
            if (!boo) {
                throw new UsecaseException(UsecaseCode.NAME_DUPLICATED);
            }
            datasetClassificationUseCase.saveDatasetClassification(datasetClassificationBO);
        } catch (Exception e) {
            throw e;
        } finally {
            distributedLock.unlock(lockKey);
        }
    }
}
