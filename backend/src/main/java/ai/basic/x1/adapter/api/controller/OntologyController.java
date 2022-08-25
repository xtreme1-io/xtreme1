package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.OntologyDTO;
import ai.basic.x1.entity.OntologyBO;
import ai.basic.x1.usecase.OntologyUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import org.springframework.web.bind.annotation.*;

/**
 * @author chenchao
 * @date 2022/8/24
 */
@RestController
@RequestMapping("/ontology/")
public class OntologyController {

    private final OntologyUseCase ontologyUseCase;

    public OntologyController(OntologyUseCase ontologyUseCase) {
        this.ontologyUseCase = ontologyUseCase;
    }

    @GetMapping("findByPage")
    public Page<OntologyDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo, @RequestParam(defaultValue = "10") Integer pageSize, OntologyDTO ontologyDTO) {
        Page<OntologyBO> ontologyPage = ontologyUseCase.findByPage(pageNo, pageSize, DefaultConverter.convert(ontologyDTO, OntologyBO.class));
        return DefaultConverter.convert(ontologyPage, OntologyDTO.class);
    }

    @GetMapping("info/{id}")
    public OntologyDTO info(@PathVariable("id") Long id) {
        return DefaultConverter.convert(ontologyUseCase.findById(id), OntologyDTO.class);
    }

}
