package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.ClassDTO;
import ai.basic.x1.entity.ClassBO;
import ai.basic.x1.usecase.ClassUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.StrUtil;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
    public Page<ClassDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo, @RequestParam(defaultValue = "10") Integer pageSize, @Validated ClassDTO classDTO) {
        return DefaultConverter.convert(classUseCase.findByPage(pageNo, pageSize, Objects.requireNonNull(DefaultConverter.convert(classDTO, ClassBO.class))), ClassDTO.class);
    }

    @PostMapping("/save")
    public void save(@RequestBody @Validated() ClassDTO classDTO) {
        classUseCase.saveClass(Objects.requireNonNull(DefaultConverter.convert(classDTO, ClassBO.class)));
    }

    @PostMapping("/delete/{id}")
    public Boolean delete(@PathVariable("id") Long id) {
        return classUseCase.deleteClass(id);
    }

    @GetMapping("/validateName")
    public Boolean validateName(@RequestParam(required = false) Long id, @RequestParam Long ontologyId, @RequestParam String name) {
        if (StrUtil.isEmpty(name)) {
            return false;
        }
        return classUseCase.validateName(id,ontologyId, name);
    }

}
