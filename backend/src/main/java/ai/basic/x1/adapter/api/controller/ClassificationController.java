package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.ClassificationDTO;
import ai.basic.x1.entity.ClassificationBO;
import ai.basic.x1.usecase.ClassificationUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.StrUtil;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

/**
 * @author chenchao
 * @date 2022/4/2
 */
@RestController
@RequestMapping("/classification/")
public class ClassificationController {

    private final ClassificationUseCase classificationUseCase;

    public ClassificationController(ClassificationUseCase classificationUseCase) {
        this.classificationUseCase = classificationUseCase;
    }

    @GetMapping("info/{id}")
    public ClassificationDTO info(@PathVariable("id") Long id) {
        return DefaultConverter.convert(classificationUseCase.findById(id), ClassificationDTO.class);
    }

    @GetMapping("findByPage")
    public Page<ClassificationDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo, @RequestParam(defaultValue = "10") Integer pageSize, @Validated ClassificationDTO classificationDTO) {
        return DefaultConverter.convert(classificationUseCase.findByPage(pageNo, pageSize, Objects.requireNonNull(DefaultConverter.convert(classificationDTO, ClassificationBO.class))), ClassificationDTO.class);
    }

    @PostMapping("create")
    public void create(@Validated @RequestBody ClassificationDTO classificationDTO) {
        save(classificationDTO);
    }

    @PostMapping("update/{id}")
    public void update(@PathVariable Long id, @Validated @RequestBody ClassificationDTO classificationDTO) {
        classificationDTO.setId(id);
        save(classificationDTO);
    }

    public void save(ClassificationDTO classificationDTO) {
        classificationUseCase.saveClassification(Objects.requireNonNull(DefaultConverter.convert(classificationDTO, ClassificationBO.class)));
    }

    @PostMapping("delete/{id}")
    public Boolean delete(@PathVariable("id") Long id) {
        return classificationUseCase.deleteClassification(id);
    }


    @GetMapping("/validateName")
    public Boolean validateName(@RequestParam(required = false) Long id, @RequestParam Long ontologyId, @RequestParam String name) {
        if (StrUtil.isEmpty(name)) {
            return false;
        }
        return classificationUseCase.validateName(id, ontologyId, name);
    }

}
