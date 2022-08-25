package ai.basic.x1.adapter.api.controller;


import ai.basic.x1.adapter.dto.ClassificationDTO;
import ai.basic.x1.entity.ClassificationBO;
import ai.basic.x1.usecase.ClassificationUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
* @author chenchao
* @version 1.0
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
        return DefaultConverter.convert(classificationUseCase.findById(id),ClassificationDTO.class);
    }

    @GetMapping("findByPage")
    public Page<ClassificationDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo, @RequestParam(defaultValue = "10") Integer pageSize, @Validated ClassificationDTO classificationDTO) {
        return DefaultConverter.convert(classificationUseCase.findByPage(pageNo, pageSize, DefaultConverter.convert(classificationDTO, ClassificationBO.class)),ClassificationDTO.class);
    }

}
