package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.DatasetClassDTO;
import ai.basic.x1.adapter.dto.request.DatasetClassCopyDTO;
import ai.basic.x1.entity.DatasetClassBO;
import ai.basic.x1.entity.enums.ToolTypeEnum;
import ai.basic.x1.usecase.DatasetClassUseCase;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.ObjectUtil;
import org.springframework.util.Assert;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Objects;

/**
 * @author chenchao
 * @date 2022/3/11
 */
@RestController
@RequestMapping("/datasetClass")
public class DatasetClassController {

    private final DatasetClassUseCase datasetClassUseCase;

    public DatasetClassController(DatasetClassUseCase datasetClassUseCase) {
        this.datasetClassUseCase = datasetClassUseCase;
    }

    @PostMapping("/create")
    public void create(@Validated @RequestBody DatasetClassDTO datasetClassDTO) {
        save(datasetClassDTO);
    }

    @PostMapping("/update/{id}")
    public void update(@PathVariable Long id, @Validated @RequestBody DatasetClassDTO datasetClassDTO) {
        datasetClassDTO.setId(id);
        save(datasetClassDTO);
    }

    @PostMapping("/delete/{id}")
    public void delete(@PathVariable("id") Long id) {
        datasetClassUseCase.deleteClass(id);
    }

    @PostMapping("/deleteByIds")
    public void delete(@RequestBody List<Long> ids) {
        if (ObjectUtil.isEmpty(ids)){
            throw new UsecaseException(UsecaseCode.UNKNOWN,"ID list can not be empty!");
        }
        datasetClassUseCase.deleteClasses(ids);
    }

    @PostMapping("/copyFromOntologyCenter")
    public void copyFromOntologyCenter(@RequestBody() @Validated DatasetClassCopyDTO datasetClassCopyDTO) {
        datasetClassUseCase.copyFromOntologyCenter(DefaultConverter.convert(datasetClassCopyDTO, DatasetClassBO.class));
    }
    @PostMapping("/saveToOntologyCenter")
    public void saveToOntologyCenter(@RequestBody() @Validated DatasetClassCopyDTO datasetClassCopyDTO) {
        datasetClassUseCase.saveToOntologyCenter(datasetClassCopyDTO.getOntologyId(),datasetClassCopyDTO.getClassIds());
    }


    @GetMapping("/info/{id}")
    public DatasetClassDTO info(@PathVariable("id") Long id) {
        return DefaultConverter.convert(datasetClassUseCase.findById(id), DatasetClassDTO.class);
    }

    @GetMapping("/findByPage")
    public Page<DatasetClassDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                            @RequestParam(defaultValue = "10") Integer pageSize,
                                            DatasetClassDTO datasetClassReqDTO) {
        DatasetClassBO datasetClassBO = DefaultConverter.convert(datasetClassReqDTO, DatasetClassBO.class);
        Assert.notNull(datasetClassBO, "param can not be null");
        Assert.notNull(datasetClassBO.getDatasetId(), "datasetId can not be null");
        return DefaultConverter.convert(datasetClassUseCase.findByPage(pageNo,
                pageSize, datasetClassBO), DatasetClassDTO.class);
    }

    @GetMapping("/findAll/{datasetId}")
    public List<DatasetClassDTO> findAll(@PathVariable Long datasetId) {
        return DefaultConverter.convert(datasetClassUseCase.findAll(datasetId), DatasetClassDTO.class);
    }

    /**
     * Check whether the class name already exists in the same dataset
     *
     * @return if exists return true
     */
    @GetMapping("/validateName")
    public Boolean validateName(@RequestParam Long datasetId, @RequestParam String name, @RequestParam(required = false) Long id, @RequestParam ToolTypeEnum toolType) {
        return datasetClassUseCase.validateName(id, datasetId, name, toolType);
    }

    private void save(DatasetClassDTO dto) {
        DatasetClassBO datasetClassBO = DefaultConverter.convert(dto, DatasetClassBO.class);
        datasetClassUseCase.saveDatasetClass(Objects.requireNonNull(datasetClassBO));
    }
}
