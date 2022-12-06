package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.OntologyDTO;
import ai.basic.x1.entity.OntologyBO;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.usecase.OntologyUseCase;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.util.StrUtil;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("findAll")
    public List<OntologyDTO> findAll(@RequestParam DatasetTypeEnum type) {
        List<OntologyBO> ontologyPage = ontologyUseCase.findAll(type);
        return DefaultConverter.convert(ontologyPage, OntologyDTO.class);
    }

    @GetMapping("info/{id}")
    public OntologyDTO info(@PathVariable("id") Long id) {
        return DefaultConverter.convert(ontologyUseCase.findById(id), OntologyDTO.class);
    }

    @PostMapping("create")
    public void create(@Validated @RequestBody OntologyDTO ontologyDTO) {
        save(ontologyDTO);
    }

    @PostMapping("update/{id}")
    public void update(@PathVariable Long id, @Validated @RequestBody OntologyDTO ontologyDTO) {
        ontologyDTO.setId(id);
        save(ontologyDTO);
    }

    public void save(OntologyDTO ontologyDTO) {
        ontologyUseCase.saveOntology(DefaultConverter.convert(ontologyDTO, OntologyBO.class));
    }

    @PostMapping("delete/{id}")
    public Boolean delete(@PathVariable("id") Long id) {
        return ontologyUseCase.deleteOntology(id);
    }

    @GetMapping("validateName")
    public Boolean validateName(@RequestParam(value = "id", required = false) Long id, @RequestParam("name") String name,@RequestParam("type") DatasetTypeEnum type) {
        if (StrUtil.isEmpty(name)) {
            return false;
        }
        return ontologyUseCase.validateName(id, name, type);
    }

}
