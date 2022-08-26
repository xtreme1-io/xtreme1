package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.ModelDTO;
import ai.basic.x1.entity.ModelBO;
import ai.basic.x1.usecase.ModelUseCase;
import ai.basic.x1.util.DefaultConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@RestController
@RequestMapping("/model")
public class ModelController {

    @Autowired
    private ModelUseCase modelUseCase;

    @GetMapping("/list")
    public List<ModelDTO> findAll(ModelDTO modelDTO){
        return DefaultConverter.convert(modelUseCase.findAll(DefaultConverter.convert(modelDTO, ModelBO.class)), ModelDTO.class);
    }
}
