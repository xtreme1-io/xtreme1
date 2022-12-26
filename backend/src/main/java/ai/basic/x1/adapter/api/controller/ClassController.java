package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.ClassDTO;
import ai.basic.x1.entity.ClassBO;
import ai.basic.x1.entity.enums.ToolTypeEnum;
import ai.basic.x1.usecase.ClassUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.StrUtil;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

/**
 * @author chenchao
 * @date 2022/8/24
 */
@RestController
@RequestMapping("/class")
public class ClassController {

    private final ClassUseCase classUseCase;

    public ClassController(ClassUseCase classUseCase) {
        this.classUseCase = classUseCase;
    }

    @GetMapping("/info/{id}")
    public ClassDTO info(@PathVariable("id") Long id) {
        return DefaultConverter.convert(classUseCase.findById(id), ClassDTO.class);
    }

    @GetMapping("/findByPage")
    public Page<ClassDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo, @RequestParam(defaultValue = "10") Integer pageSize, ClassDTO classDTO) {
        Objects.requireNonNull(classDTO.getOntologyId(),"ontology id can not be null");
        return DefaultConverter.convert(classUseCase.findByPage(pageNo, pageSize, Objects.requireNonNull(DefaultConverter.convert(classDTO, ClassBO.class))), ClassDTO.class);
    }

    @GetMapping("/findAll/{ontologyId}")
    public List<ClassDTO> findAllByOntologyId(@PathVariable Long ontologyId, @RequestParam(required = false) ToolTypeEnum toolType) {
        return DefaultConverter.convert(classUseCase.findAll(ontologyId, toolType), ClassDTO.class);
    }

    @PostMapping("create")
    public void create(@Validated @RequestBody ClassDTO classDTO) {
        save(classDTO);
    }

    @PostMapping("update/{id}")
    public void update(@PathVariable Long id, @Validated @RequestBody ClassDTO classDTO) {
        classDTO.setId(id);
        save(classDTO);
    }

    public void save(ClassDTO classDTO) {
        classUseCase.saveClass(Objects.requireNonNull(DefaultConverter.convert(classDTO, ClassBO.class)));
    }

    @PostMapping("/delete/{id}")
    public Boolean delete(@PathVariable("id") Long id) {
        return classUseCase.deleteClass(id);
    }

    @GetMapping("/validateName")
    public Boolean validateName(@RequestParam(required = false) Long id, @RequestParam Long ontologyId, @RequestParam String name, @RequestParam ToolTypeEnum toolType) {
        if (StrUtil.isEmpty(name)) {
            return false;
        }
        return classUseCase.validateName(id, ontologyId, name, toolType);
    }

    @PostMapping("/pushAttributesToDataset/{id}")
    public void pushAttributesToDataset(@PathVariable("id") Long id) {
        classUseCase.pushAttributesToDataset(id);
    }

    @GetMapping("/getRelatedDatasetClassNum/{id}")
    public long getRelatedDatasetClassNum(@PathVariable("id") Long id) {
        return classUseCase.getRelatedDatasetClassNum(id);
    }

}
