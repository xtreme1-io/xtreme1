package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.api.context.RequestContextHolder;
import ai.basic.x1.adapter.dto.OntologyDTO;
import ai.basic.x1.adapter.dto.request.ClassAndClassificationImportReqDTO;
import ai.basic.x1.adapter.dto.response.ClassAndClassificationImportRespDTO;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.ClassAndClassificationSourceEnum;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.usecase.DatasetUseCase;
import ai.basic.x1.usecase.OntologyUseCase;
import ai.basic.x1.usecase.exception.UsecaseException;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;

import java.util.List;

/**
 * @author chenchao
 * @date 2022/8/24
 */
@RestController
@RequestMapping("/ontology")
public class OntologyController {

    private Logger logger = LoggerFactory.getLogger(getClass());

    private final OntologyUseCase ontologyUseCase;

    @Autowired
    private DatasetUseCase datasetUseCase;

    public OntologyController(OntologyUseCase ontologyUseCase) {
        this.ontologyUseCase = ontologyUseCase;
    }

    @GetMapping("/findByPage")
    public Page<OntologyDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo, @RequestParam(defaultValue = "10") Integer pageSize, OntologyDTO ontologyDTO) {
        Page<OntologyBO> ontologyPage = ontologyUseCase.findByPage(pageNo, pageSize, DefaultConverter.convert(ontologyDTO, OntologyBO.class));
        return DefaultConverter.convert(ontologyPage, OntologyDTO.class);
    }

    @GetMapping("/findAll")
    public List<OntologyDTO> findAll(@RequestParam DatasetTypeEnum type) {
        List<OntologyBO> ontologyPage = ontologyUseCase.findAll(type);
        return DefaultConverter.convert(ontologyPage, OntologyDTO.class);
    }

    @GetMapping("/info/{id}")
    public OntologyDTO info(@PathVariable("id") Long id) {
        return DefaultConverter.convert(ontologyUseCase.findById(id), OntologyDTO.class);
    }

    @PostMapping("/create")
    public Long create(@Validated @RequestBody OntologyDTO ontologyDTO) {
        return save(ontologyDTO);
    }

    @PostMapping("/update/{id}")
    public void update(@PathVariable Long id, @Validated @RequestBody OntologyDTO ontologyDTO) {
        ontologyDTO.setId(id);
        save(ontologyDTO);
    }

    public Long save(OntologyDTO ontologyDTO) {
        DefaultConverter.convert(ontologyDTO, OntologyBO.class);
        return ontologyUseCase.saveOntology(DefaultConverter.convert(ontologyDTO, OntologyBO.class));
    }

    @PostMapping("/delete/{id}")
    public Boolean delete(@PathVariable("id") Long id) {
        return ontologyUseCase.deleteOntology(id);
    }

    @GetMapping("/validateName")
    public Boolean validateName(@RequestParam(value = "id", required = false) Long id, @RequestParam("name") String name, @RequestParam("type") DatasetTypeEnum type) {
        if (StrUtil.isEmpty(name)) {
            return false;
        }
        return ontologyUseCase.validateName(id, name, type);
    }

    @PostMapping(value = "/importByJson", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ClassAndClassificationImportRespDTO importByJson(ClassAndClassificationImportReqDTO dto) throws IOException {
        return DefaultConverter.convert(ontologyUseCase.importByJson(dto.getFile(), dto.getDesId(), dto.getDesType()), ClassAndClassificationImportRespDTO.class);
    }

    @PostMapping(value = "/saveClassAndClassificationBatch")
    public ClassAndClassificationImportRespDTO saveClassAndClassificationBatch(@RequestBody ClassAndClassificationImportRespDTO dto) throws IOException {
        if (ClassAndClassificationSourceEnum.ONTOLOGY.equals(dto.getDesType())) {
            List<ClassBO> classes = DefaultConverter.convert(dto.getClasses(), ClassBO.class);
            if (ObjectUtil.isEmpty(classes)) {
                dto.setValidClassSize(0);
            } else {
                dto.setValidClassSize(classes.size());
                classes.forEach(c -> c.setOntologyId(dto.getDesId()));
            }
            List<ClassificationBO> classifications = DefaultConverter.convert(dto.getClassifications(), ClassificationBO.class);
            if (ObjectUtil.isEmpty(classifications)) {
                dto.setValidClassificationSize(0);
            } else {
                dto.setValidClassificationSize(classifications.size());
                classifications.forEach(c -> c.setOntologyId(dto.getDesId()));
            }
            ontologyUseCase.saveOrUpdateBatch(classes, null, classifications, null);

        } else {
            List<DatasetClassBO> classes = DefaultConverter.convert(dto.getClasses(), DatasetClassBO.class);
            if (ObjectUtil.isEmpty(classes)) {
                dto.setValidClassSize(0);
            } else {
                dto.setValidClassSize(classes.size());
                classes.forEach(c -> c.setDatasetId(dto.getDesId()));
            }
            List<DatasetClassificationBO> classifications = DefaultConverter.convert(dto.getClassifications(), DatasetClassificationBO.class);
            if (ObjectUtil.isEmpty(classifications)) {
                dto.setValidClassificationSize(0);
            } else {
                dto.setValidClassificationSize(classifications.size());
                classifications.forEach(c -> c.setDatasetId(dto.getDesId()));
            }
            ontologyUseCase.saveOrUpdateBatch(null, classes, null, classifications);
        }
        return dto;
    }

    @GetMapping("/exportAsJson")
    public void exportAsJson(@RequestParam Long sourceId, @RequestParam ClassAndClassificationSourceEnum sourceType, HttpServletResponse response) throws IOException {
            ClassAndClassificationExportParamBO param = ClassAndClassificationExportParamBO.builder().sourceId(sourceId).sourceType(sourceType).build();
        String sourceName = "";

        if (ClassAndClassificationSourceEnum.ONTOLOGY.equals(sourceType)) {
            OntologyBO ontologyBO = ontologyUseCase.findById(sourceId);
            if (ObjectUtil.isNotNull(ontologyBO)) {
                sourceName = ontologyBO.getName();
            }
        } else {
            DatasetBO datasetBO = datasetUseCase.findById(sourceId);
            if (ObjectUtil.isNotNull(datasetBO)) {
                sourceName = datasetBO.getName();
            }
        }
        String fileName = ClassAndClassificationSourceEnum.ONTOLOGY.equals(sourceType)?"ontology_"+sourceName:"dataset_"+sourceName+"_ontology";
        syncExportJson(response, fileName, ontologyUseCase.queryClassAndClassification(param));
    }

    /**
     * export json file
     *
     * @param response
     * @param filename file name
     * @param message  data that need export
     */
    public void syncExportJson(HttpServletResponse response, String filename, ClassAndClassificationExportBO message) {
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        try (var os = response.getOutputStream()) {
            var contentDisposition = "attachment;filename=" + URLEncoder.encode(filename + ".json", "UTF-8")
                    + ";filename*=UTF-8''" + URLEncoder.encode(filename + ".json", "UTF-8");
            response.setHeader("Content-Disposition", contentDisposition);
            //write file header utf-8
            os.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});
            os.flush();
            var jsonConfig = JSONConfig.create().setDateFormat(DatePattern.NORM_DATETIME_PATTERN);
            var str = JSONUtil.toJsonStr(message, jsonConfig);
            os.write(str.getBytes());
            os.flush();

        } catch (UnsupportedEncodingException e) {
            logger.error("export data error", e);
            throw new UsecaseException("export data error,message:" + e.getMessage() + "");
        } catch (IOException e) {
            logger.error("export data error", e);
            throw new UsecaseException("export data error,message:" + e.getMessage() + "");
        }
    }

}
